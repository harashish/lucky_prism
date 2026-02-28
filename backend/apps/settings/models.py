from django.db import models
from apps.gamification.models import User


class ModuleDefinition(models.Model):
    MODULE_CHOICES = [
        ("habits", "Habits"),
        ("challenges", "Challenges"),
        ("todos", "Todos"),
        ("goals", "Goals"),
        ("random", "Random"),
        ("gamification", "Gamification"),
        ("notes", "Notes"),

        ("mood", "Mood"),          # ← ADD
        ("sobriety", "Sobriety"),  # ← ADD
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.CharField(max_length=30, choices=MODULE_CHOICES)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "module")

    def __str__(self):
        return f"{self.user_id}:{self.module}:{self.is_enabled}"


class DashboardTile(models.Model):
    TILE_KEYS = [
        ("level_gamification", "Level gamification"),
        ("biggest_streak", "Biggest streak"),
        ("random_habit", "Random habit"),
        ("random_todo", "Random todo"),
        ("goal_week", "Week goal"),
        ("goal_month", "Month goal"),
        ("goal_year", "Year goal"),
        ("daily_challenge", "Daily challenge"),
        ("weekly_challenge", "Weekly challenge"),
        ("random_note", "Random note"),
    ]

    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    key = models.CharField(
    max_length=50,

    choices=TILE_KEYS
    )
    name = models.CharField(max_length=120)
    is_enabled = models.BooleanField(default=True)    
    module_dependency = models.CharField(
    max_length=30,

    choices=ModuleDefinition.MODULE_CHOICES,
    blank=True,
    null=True
)

    class Meta:
        unique_together = ("user", "key")

    def __str__(self):
        return f"{self.user_id}:{self.key}:{self.is_enabled}"

class UserPreference(models.Model):
    PREFERENCE_KEYS = [
        ("hide_quick_add_difficulty", "Hide quick add difficulty"),
        ("hide_todo_completed_toggle", "Hide todo completed toggle"),
        ("default_todo_category_id", "Default todo category"),
    ]

    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    key = models.CharField(max_length=50, choices=PREFERENCE_KEYS)
    value = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        unique_together = ("user", "key")

    def __str__(self):
        return f"{self.user_id}:{self.key}:{self.value}"        