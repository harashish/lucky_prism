# apps/challenges/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta, datetime, time
from apps.gamification.services.xp_calculator import calculate_xp

class ChallengeType(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name


class ChallengeTag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name


class ChallengeDefinition(models.Model):
    title = models.CharField(max_length=70, unique=True)
    description = models.TextField(blank=True)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    type = models.ForeignKey(ChallengeType, on_delete=models.PROTECT)
    tags = models.ManyToManyField(ChallengeTag, blank=True)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class UserChallenge(models.Model):
    """
    Instancja challenge przypisana użytkownikowi.
    Weekly challenge ma 7-dniowy timer od momentu rozpoczęcia.
    """

    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    definition = models.ForeignKey(ChallengeDefinition, on_delete=models.CASCADE)
    challenge_type = models.CharField(max_length=20)  # daily/weekly

    start_date = models.DateField(auto_now_add=True)
    weekly_deadline = models.DateField(null=True, blank=True)

    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def start_weekly_if_needed(self):
        if self.challenge_type == "Weekly" and not self.weekly_deadline:
            self.weekly_deadline = self.start_date + timedelta(days=7)
            self.save()

    @property
    def weekly_progress_days(self):
        if self.challenge_type != "Weekly" or not self.weekly_deadline:
            return None

        start = self.start_date
        today = timezone.now().date()

        # min 1 dzień od razu w dniu startu
        days_passed = (today - start).days + 1

        return max(1, min(7, days_passed))
    
    def complete(self):
        if self.is_completed:
            return

        xp = calculate_xp(
            module="challenges",
            difficulty=self.definition.difficulty.name.lower(),
            period=self.challenge_type.lower(),
        )

        self.user.add_xp(
            xp=xp,
            source="challenge",
            source_id=self.id,
        )

        ChallengeHistory.objects.create(
            user_challenge=self,
            xp_gained=xp,
        )

        self.is_completed = True
        self.save(update_fields=["is_completed", "updated_at"])

        return xp


class ChallengeHistory(models.Model):
    user_challenge = models.ForeignKey(UserChallenge, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField(default=0)

