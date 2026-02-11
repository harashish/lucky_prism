from django.db import models

class TodoCategory(models.Model):
    name = models.CharField(max_length=30)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    color = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.name}"

class TodoTask(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    content = models.TextField()
    custom_difficulty = models.ForeignKey(
        "common.DifficultyType",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )

    category = models.ForeignKey(
        TodoCategory,
        on_delete=models.PROTECT,
        related_name="tasks",
    )

    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.content[:40]



