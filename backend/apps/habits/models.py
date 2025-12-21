from django.db import models

class Habit(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=70)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField(blank=True)
    color = models.CharField(max_length=20, default="#908bab")
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.user_id})"


class HabitDay(models.Model):
    STATUS_EMPTY = 0
    STATUS_SKIPPED = 1
    STATUS_COMPLETED = 2

    STATUS_CHOICES = [
        (STATUS_EMPTY, "empty"),
        (STATUS_SKIPPED, "skipped"),
        (STATUS_COMPLETED, "completed"),
    ]

    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name="days")
    date = models.DateField()
    status = models.IntegerField(choices=STATUS_CHOICES, default=STATUS_EMPTY)
    xp_awarded = models.BooleanField(default=False)  # whether XP was granted for this day already
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("habit", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.habit_id} - {self.date} : {self.get_status_display()}"
