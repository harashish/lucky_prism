# apps/notes/serializers.py
from rest_framework import serializers
from .models import RandomNote

class RandomNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RandomNote
        fields = ['id', 'user', 'content', 'created_at', 'updated_at']
