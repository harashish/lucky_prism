from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.gamification.services.xp_calculator import calculate_xp


# ---------- ENUM: DAILY / WEEKLY ----------

class ChallengeType(models.Model):
    name = models.CharField(
        max_length=10,
        choices=[
            ("daily", "Daily"),
            ("weekly", "Weekly"),
        ],
        unique=True,
    )

    def __str__(self):
        return self.name


# ---------- TAG ----------

class ChallengeTag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name


# ---------- DEFINITION (SZABLON) ----------

class ChallengeDefinition(models.Model):
    title = models.CharField(max_length=70, unique=True)
    description = models.TextField(blank=True)
    difficulty = models.ForeignKey(
        "common.DifficultyType",
        on_delete=models.PROTECT,
    )
    type = models.ForeignKey(
        ChallengeType,
        on_delete=models.PROTECT,
    )
    tags = models.ManyToManyField(ChallengeTag, blank=True)
    is_default = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# ---------- USER CHALLENGE (SINGLETON-READY) ----------

class UserChallenge(models.Model):
    """
    Instancja challenga przypisana do użytkownika.
    Singleton = aplikacja zakłada jednego usera,
    ale model dalej jest poprawny architektonicznie.
    """

    user = models.ForeignKey(
        "gamification.User",
        on_delete=models.CASCADE,
        related_name="challenges",
    )
    definition = models.ForeignKey(
        ChallengeDefinition,
        on_delete=models.CASCADE,
    )
    challenge_type = models.ForeignKey(
        ChallengeType,
        on_delete=models.PROTECT,
    )

    start_date = models.DateField(auto_now_add=True)
    weekly_deadline = models.DateField(null=True, blank=True)

    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # --- weekly init ---

    def start_weekly_if_needed(self):
        if self.challenge_type.name == "weekly" and not self.weekly_deadline:
            self.weekly_deadline = self.start_date + timedelta(days=7)
            self.save(update_fields=["weekly_deadline"])

    # --- weekly progress ---

    @property
    def weekly_progress_days(self):
        if self.challenge_type.name != "weekly" or not self.weekly_deadline:
            return None

        today = timezone.now().date()
        days_passed = (today - self.start_date).days + 1

        return max(1, min(7, days_passed))

    # --- completion + XP ---

    def complete(self):
        if self.is_completed:
            return None

        xp = calculate_xp(
            module="challenges",
            difficulty=self.definition.difficulty.name.lower(),
            period=self.challenge_type.name,
            user=self.user,
        )

        self.user.add_xp(
            xp=xp,
            source="challenge",
            source_id=self.id,
        )

        self.is_completed = True
        self.save(update_fields=["is_completed", "updated_at"])

        return xp


