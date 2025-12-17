# apps/notes/models.py

from django.db import models

class RandomNote(models.Model):
    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

