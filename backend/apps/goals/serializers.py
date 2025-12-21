# apps/goals/serializers.py
from rest_framework import serializers
from .models import Goal, GoalHistory, GoalPeriod
from apps.common.models import DifficultyType
from apps.common.serializers import DifficultyTypeSerializer  # optional if you have it; otherwise define below
from apps.gamification.models import User

class GoalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalPeriod
        fields = ['id', 'name']

class GoalSerializer(serializers.ModelSerializer):
    period = GoalPeriodSerializer(read_only=True)
    difficulty = DifficultyTypeSerializer(read_only=True)
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    motivation_reason = serializers.CharField(allow_blank=False)

    period_id = serializers.PrimaryKeyRelatedField(
        queryset=GoalPeriod.objects.all(),
        write_only=True,
        source='period'
    )
    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source='difficulty'
    )
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        source='user'
    )

    class Meta:
        model = Goal
        fields = [
            'id', 'title', 'description', 'motivation_reason',
            'period', 'period_id', 'difficulty', 'difficulty_id',
            'user', 'user_id',
            'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

class GoalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalHistory
        fields = ['id', 'goal', 'completion_date', 'xp_gained']
