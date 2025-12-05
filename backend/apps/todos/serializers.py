# apps/todos/serializers.py
from rest_framework import serializers
from .models import TodoCategory, TodoTask, TodoHistory

class TodoCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoCategory
        fields = ['id', 'name', 'difficulty']

class TodoTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoTask
        fields = [
            'id', 'user', 'content', 'is_default',
            'custom_difficulty', 'category',
            'created_at', 'updated_at'
        ]

class TodoHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoHistory
        fields = ['id', 'task', 'completion_date', 'xp_gained']
