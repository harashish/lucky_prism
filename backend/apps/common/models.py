from django.db import models

class DifficultyType(models.Model):
    name = models.CharField(max_length=20, unique=True)
    order = models.PositiveSmallIntegerField()

