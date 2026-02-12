from django.db import models


class Achievement(models.Model):
    """
    Definicja achievementa (template).
    Może być systemowy albo customowy użytkownika.
    """

    CONDITION_TYPES = [

        ("habit_days", "X days of specific habit"),
        ("any_habit_days", "X days of any habit"),
        ("habit_streak", "X day streak of specific habit"),
        ("any_habit_streak", "X day streak of any habit"),

        ("goal_completed", "X completed goals"),
        ("goal_completed_by_period", "X completed goals by period"),

        ("todo_completed", "X completed todos"),

        ("notes_count", "Create X notes"),

        ("mood_logged_days", "Log mood X days"),
        ("specific_mood_count", "Log specific mood X times"),

        ("sobriety_duration", "X duration of specific sobriety"),
        ("any_sobriety_duration", "X duration of any sobriety"),

        ("level_reached", "Reach level"),
        ("xp_reached", "Reach XP"),

        ("manual", "Manual unlock"),
    ]

    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)

    difficulty = models.ForeignKey(
        "common.DifficultyType",
        on_delete=models.PROTECT,
    )

    condition_type = models.CharField(
        max_length=40,
        choices=CONDITION_TYPES,
    )

    # parametry condition (np days=30, habit_id=5, xp=1000)
    condition_config = models.JSONField(default=dict)

    # czy ukryty dopóki nie odblokowany
    is_hidden = models.BooleanField(default=False)

    # systemowy czy customowy usera
    user = models.ForeignKey(
        "gamification.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="custom_achievements",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["difficulty__order", "name"]

    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """
    Stan achievementa dla usera.
    """

    user = models.ForeignKey(
        "gamification.User",
        on_delete=models.CASCADE,
        related_name="achievements",
    )

    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name="user_states",
    )

    # aktualny progress (np 7)
    current_value = models.IntegerField(default=0)

    # target wymagany do unlocka (np 30)
    # kopiowany z condition_config przy tworzeniu
    target_value = models.IntegerField()

    is_completed = models.BooleanField(default=False)

    completed_at = models.DateTimeField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "achievement")

    def __str__(self):
        return f"{self.user_id} - {self.achievement.name}"

    @property
    def progress_percent(self):
        if not self.target_value:
            return 0
        return min(100, int((self.current_value / self.target_value) * 100))