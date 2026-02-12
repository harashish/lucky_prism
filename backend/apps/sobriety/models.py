from django.db import models
from django.utils import timezone

class Sobriety(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    motivation_reason = models.TextField()

    started_at = models.DateTimeField(default=timezone.now)
    ended_at = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def current_duration(self):
        if self.is_active:
            return timezone.now() - self.started_at
        if self.ended_at:
            return self.ended_at - self.started_at
        return None

    def __str__(self):
        return self.name
    
class SobrietyRelapse(models.Model):
    sobriety = models.ForeignKey(
        Sobriety,
        on_delete=models.CASCADE,
        related_name="relapses",
    )

    occurred_at = models.DateTimeField(default=timezone.now)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.sobriety.name} relapse at {self.occurred_at}"    