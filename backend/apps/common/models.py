# backend/apps/common/models.py
from django.db import models

class DifficultyType(models.Model):
    name = models.CharField(max_length=15, unique=True)
    xp_value = models.IntegerField()

