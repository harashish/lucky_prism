from rest_framework import serializers
from .models import Goal, GoalPeriod
from apps.common.models import DifficultyType
from apps.common.serializers import DifficultyTypeSerializer
from apps.gamification.utils import get_user


class GoalPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalPeriod
        fields = ["id", "name"]


class GoalSerializer(serializers.ModelSerializer):
    period = GoalPeriodSerializer(read_only=True)
    difficulty = DifficultyTypeSerializer(read_only=True)

    period_id = serializers.PrimaryKeyRelatedField(
        queryset=GoalPeriod.objects.all(),
        write_only=True,
        source="period",
    )
    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source="difficulty",
    )

    motivation_reason = serializers.CharField(allow_blank=False)

    class Meta:
        model = Goal
        fields = [
            "id",
            "title",
            "description",
            "motivation_reason",
            "period",
            "period_id",
            "difficulty",
            "difficulty_id",
            "is_completed",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        validated_data["user"] = get_user()
        return super().create(validated_data)

