# apps/todos/models.py

from django.db import models
from apps.gamification.services.xp_calculator import calculate_xp


class TodoCategory(models.Model):
    name = models.CharField(max_length=30)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    color = models.CharField(max_length=20, blank=True, null=True)  # opcjonalnie kolor

    def __str__(self):
        return f"{self.name}"

class TodoTask(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    content = models.TextField()
    is_default = models.BooleanField(default=False)
    custom_difficulty = models.ForeignKey(
        "common.DifficultyType",
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    category = models.ForeignKey(TodoCategory, on_delete=models.PROTECT, related_name="tasks")
    is_completed = models.BooleanField(default=False)   # status (przydatne dla listy)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.content[:40]}"

class TodoHistory(models.Model):
    task = models.ForeignKey(TodoTask, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField()

    def complete(self):
        diff = self.task.custom_difficulty or self.task.category.difficulty

        xp = calculate_xp(
            module="todos",
            difficulty=diff.name.lower(),
        ) if diff else 0

        self.xp_gained = xp
        self.save()

        self.task.user.add_xp(
            xp=xp,
            source="todo",
            source_id=self.id,
        )


