# apps/goals/serializers.py
from rest_framework import serializers
from .models import Goal, GoalHistory, GoalPeriod

class GoalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalPeriod
        fields = ['id', 'name', 'default_xp']

class GoalSerializer(serializers.ModelSerializer):
    period = GoalPeriodSerializer(read_only=True)
    period_id = serializers.PrimaryKeyRelatedField(
        queryset=GoalPeriod.objects.all(),
        write_only=True,
        source="period"
    )

    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'motivation_reason',
            'period', 'period_id', 'difficulty', 'user',
            'created_at', 'updated_at'
        ]

class GoalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalHistory
        fields = ['id', 'goal', 'completion_date', 'xp_gained']
