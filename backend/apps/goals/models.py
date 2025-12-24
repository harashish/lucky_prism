from django.db import models
from apps.gamification.services.xp_calculator import calculate_xp


class GoalPeriod(models.Model):
    name = models.CharField(max_length=10)  # weekly, monthly, yearly

class Goal(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=30)
    description = models.TextField(blank=True)

    # motivation_reason obowiązkowe
    motivation_reason = models.TextField()
    period = models.ForeignKey(GoalPeriod, on_delete=models.PROTECT)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class GoalHistory(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField(default=0)

    def complete(self):
        xp = calculate_xp(
            module="goals",
            difficulty=self.goal.difficulty.name.lower(),
            period=self.goal.period.name.lower(),
        )

        self.xp_gained = xp
        self.save()

        self.goal.user.add_xp(
            xp=xp,
            source="goal",
            source_id=self.id,
        )

