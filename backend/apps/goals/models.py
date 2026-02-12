from django.db import models
from django.utils import timezone
from datetime import date

class GoalPeriod(models.Model):
    name = models.CharField(
        max_length=10,
        choices=[
            ("weekly", "Weekly"),
            ("monthly", "Monthly"),
            ("yearly", "Yearly"),
        ],
        unique=True,
    )

    # po co to?
    def __str__(self):
        return self.name

class Goal(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField()

    # tekstowe progi
    floor_goal = models.TextField(blank=True)
    target_goal = models.TextField(blank=True)
    ceiling_goal = models.TextField(blank=True)

    period = models.ForeignKey(GoalPeriod, on_delete=models.PROTECT)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)

    def has_period_expired(self):
        today = timezone.now().date()

        if self.period.name == "weekly":
            # jeśli tydzień się zmienił (ISO week)
            return today.isocalendar()[1] != self.created_at.date().isocalendar()[1]

        if self.period.name == "monthly":
            return (
                today.month != self.created_at.month
                or today.year != self.created_at.year
            )

        if self.period.name == "yearly":
            return today.year != self.created_at.year

        return False

    def archive(self):
        self.is_archived = True
        self.archived_at = timezone.now()
        self.save(update_fields=["is_archived", "archived_at"])

    def __str__(self):
        return self.title

class GoalStep(models.Model):
    goal = models.ForeignKey(
        Goal,
        on_delete=models.CASCADE,
        related_name="steps",
    )

    title = models.CharField(max_length=150)
    is_completed = models.BooleanField(default=False)
    order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.goal.title} - {self.title}"