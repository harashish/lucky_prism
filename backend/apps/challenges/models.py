from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class ChallengeTemplate(models.Model):
    """
    Template of possible challenges (global or user-created)
    """
    DAILY = 'daily'
    WEEKLY = 'weekly'
    SCOPE_CHOICES = [(DAILY, 'Daily'), (WEEKLY, 'Weekly')]

    creator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    scope = models.CharField(max_length=10, choices=SCOPE_CHOICES, default=WEEKLY)
    difficulty = models.PositiveSmallIntegerField(default=1)  # 0 = fun, 1..n difficulty
    is_default = models.BooleanField(default=False)  # default templates provided by app

    def __str__(self):
        return f"{self.title} ({self.scope})"

class UserChallenge(models.Model):
    """
    An active assignment of a challenge to a user (user's active challenge)
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges')
    template = models.ForeignKey(ChallengeTemplate, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} -> {self.template.title}"
