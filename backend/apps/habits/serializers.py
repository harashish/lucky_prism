from rest_framework import serializers
from .models import Habit, HabitDay
from apps.common.models import DifficultyType
from apps.common.serializers import DifficultyTypeSerializer


class HabitDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitDay
        fields = [
            "id",
            "date",
            "status",
            "xp_awarded",
            "created_at",
            "updated_at",
        ]


class HabitSerializer(serializers.ModelSerializer):
    difficulty = DifficultyTypeSerializer(read_only=True)
    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source="difficulty",
    )

    motivation_reason = serializers.CharField(allow_blank=False)

    class Meta:
        model = Habit
        fields = [
            "id",
            "title",
            "description",
            "motivation_reason",
            "color",
            "difficulty",
            "difficulty_id",
            "is_active",
            "created_at",
            "updated_at",
        ]
