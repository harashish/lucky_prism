# apps/habits/models.py

from django.db import models

class Habit(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField()
    is_active = models.BooleanField(default=True)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    current_streak = models.IntegerField(default=0)
    color_hex = models.CharField(max_length=7)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class HabitTracking(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    date = models.DateField()
    is_completed = models.BooleanField(default=False)
    xp_gained = models.IntegerField(default=0)

    class Meta:
        unique_together = ('habit', 'date')

    def complete(self):
        xp = self.habit.difficulty.xp_value
        self.is_completed = True
        self.xp_gained = xp
        self.save()

        # XP
        user = self.habit.user
        user.add_xp(xp, source="habit", source_id=self.id)
