from django.db import models
from apps.gamification.models import User


class ModuleDefinition(models.Model):
    MODULE_CHOICES = [
        ("habits", "Habits"),
        ("challenges", "Challenges"),
        ("todos", "Todos"),
        ("goals", "Goals"),
        ("randomizer", "Randomizer"),
        ("gamification", "Gamification"),
        ("notes", "Notes"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.CharField(max_length=30, choices=MODULE_CHOICES)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ("user", "module")

    def __str__(self):
        return f"{self.user_id}:{self.module}:{self.is_enabled}"
