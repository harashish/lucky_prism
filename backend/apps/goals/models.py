# apps/goals/models.py

from django.db import models

class GoalPeriod(models.Model):
    name = models.CharField(max_length=10)  # week, month, year
    default_xp = models.IntegerField()

class Goal(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    title = models.CharField(max_length=30)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField(blank=True)
    period = models.ForeignKey(GoalPeriod, on_delete=models.PROTECT)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class GoalHistory(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField()

    def complete(self):
        # 1. Oblicz procent trudności (difficulty_percent)
        difficulty_percent = 0
        if self.goal.difficulty:
            # Zakładamy, że xp_value w difficulty to np. 120 (co oznacza 120%)
            difficulty_percent = (self.goal.difficulty.xp_value or 0) / 100

        # 2. Pobierz bazowe XP za okres (period_xp)
        period_xp = self.goal.period.default_xp or 0

        # 3. Oblicz końcowe XP (mnożenie i rzutowanie na int)
        xp = int(period_xp * difficulty_percent)

        # 4. Zapisz wynik w instancji
        self.xp_gained = xp
        self.save()

        # 5. Przekaż XP użytkownikowi
        self.goal.user.add_xp(xp, source="goal", source_id=self.id)
