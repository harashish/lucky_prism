from django.db import models

class ChallengeType(models.Model):
    name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class DifficultyType(models.Model):
    name = models.CharField(max_length=15, unique=True)
    xp_value = models.IntegerField()

    def __str__(self):
        return f"{self.name} ({self.xp_value} XP)"

class ChallengeTag(models.Model):
    name = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.name

class ChallengeDefinition(models.Model):
    title = models.CharField(max_length=70, unique=True)
    description = models.TextField(blank=True)
    difficulty = models.ForeignKey(DifficultyType, on_delete=models.PROTECT)
    type = models.ForeignKey(ChallengeType, on_delete=models.PROTECT)
    tags = models.ManyToManyField(ChallengeTag, blank=True)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
