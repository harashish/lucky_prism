# apps/challenges/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta, datetime, time

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

    # kopiujemy typ do stabilności danych
    challenge_type = models.CharField(max_length=20)  # "Daily" albo "Weekly"

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
    def weekly_progress_percent(self):
        if self.challenge_type != "Weekly" or not self.weekly_deadline:
            return None

        start_dt = timezone.make_aware(datetime.combine(self.start_date, time.min))
        end_dt = timezone.make_aware(datetime.combine(self.weekly_deadline, time.min))
        now = timezone.now()

        total_seconds = (end_dt - start_dt).total_seconds()
        passed_seconds = (now - start_dt).total_seconds()

        progress = max(0, min(100, int((passed_seconds / total_seconds) * 100)))
        return progress
    
    def complete(self):
        if self.is_completed:
            return

        xp = self.definition.difficulty.xp_value
        self.user.add_xp(xp, source="challenge", source_id=self.id)

        ChallengeHistory.objects.create(
            user_challenge=self,
            xp_gained=xp,
        )

        self.is_completed = True
        self.save(update_fields=["is_completed", "updated_at"])


class ChallengeHistory(models.Model):
    user_challenge = models.ForeignKey(UserChallenge, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField()
