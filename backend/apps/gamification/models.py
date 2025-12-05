# apps/gamification/models.py
from django.db import models

class User(models.Model):
    total_xp = models.BigIntegerField(default=0)
    current_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def add_xp(self, amount: int, source: str = "", source_id: int | None = None):
        self.total_xp += amount
        new_level = self.calculate_level()
        if new_level > self.current_level:
            self.current_level = new_level
        self.save()

        XPLog.objects.create(
            user=self,
            source=source,
            source_id=source_id,
            xp=amount
        )

        return self.total_xp, self.current_level

    def calculate_level(self):
        xp = self.total_xp
        level = 1
        while xp >= 100 * level:
            xp -= 100 * level
            level += 1
        return level


class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=30)  # challenge, habit, goal, todo
    source_id = models.IntegerField(null=True)
    xp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class ModuleDefinition(models.Model):
    name = models.CharField(max_length=20)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    default_xp = models.IntegerField(default=0)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ('name', 'user')

