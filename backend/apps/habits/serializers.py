# apps/habits/serializers.py
from rest_framework import serializers
from .models import Habit, HabitTracking

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = [
            'id', 'title', 'description', 'motivation_reason',
            'difficulty', 'is_active', 'current_streak', 'color_hex',
            'user', 'created_at', 'updated_at'
        ]

class HabitTrackingSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitTracking
        fields = ['id', 'habit', 'date', 'is_completed', 'xp_gained']
