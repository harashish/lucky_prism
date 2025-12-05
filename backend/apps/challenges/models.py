# apps/challenges/models.py
from django.db import models

class ChallengeType(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name
class ChallengeTag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

class ChallengeDefinition(models.Model):
    title = models.CharField(max_length=70, unique=True)
    description = models.TextField(blank=True)
    difficulty = models.ForeignKey("common.DifficultyType", on_delete=models.PROTECT)
    type = models.ForeignKey(ChallengeType, on_delete=models.PROTECT)
    tags = models.ManyToManyField(ChallengeTag, blank=True)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

# gamifikacja
# apps/challenges/models.py
class UserChallenge(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    definition = models.ForeignKey("challenges.ChallengeDefinition", on_delete=models.CASCADE)
    start_date = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)  # <-- nowy

    def complete(self):
        if self.is_completed:
            return
        xp = self.definition.difficulty.xp_value
        self.user.add_xp(xp)
        ChallengeHistory.objects.create(
            user_challenge=self,
            xp_gained=xp
        )
        self.is_completed = True  # <-- oznacz jako zakończony
        self.save()


class ChallengeHistory(models.Model):
    user_challenge = models.ForeignKey(UserChallenge, on_delete=models.CASCADE)
    completion_date = models.DateTimeField(auto_now_add=True)
    xp_gained = models.IntegerField()
