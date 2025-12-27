from rest_framework import serializers
from .models import TodoCategory, TodoTask
from apps.common.serializers import DifficultyTypeSerializer
from apps.common.models import DifficultyType


class TodoCategorySerializer(serializers.ModelSerializer):
    difficulty = DifficultyTypeSerializer(read_only=True)
    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source="difficulty"
    )

    class Meta:
        model = TodoCategory
        fields = ["id", "name", "color", "difficulty", "difficulty_id"]


class TodoTaskSerializer(serializers.ModelSerializer):
    category = TodoCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=TodoCategory.objects.all(),
        write_only=True,
        source="category"
    )

    custom_difficulty = DifficultyTypeSerializer(read_only=True)
    custom_difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source="custom_difficulty",
        required=False,
        allow_null=True
    )

    class Meta:
        model = TodoTask
        fields = [
            "id",
            "content",
            "is_default",
            "custom_difficulty",
            "custom_difficulty_id",
            "category",
            "category_id",
            "is_completed",
            "created_at",
            "updated_at",
        ]

