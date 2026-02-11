from django.db import models


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


class Goal(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField()
    period = models.ForeignKey(GoalPeriod, on_delete=models.PROTECT)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

