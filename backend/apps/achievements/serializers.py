from rest_framework import serializers
from .models import Achievement, UserAchievement
from apps.common.serializers import DifficultyTypeSerializer
from apps.common.models import DifficultyType


class AchievementSerializer(serializers.ModelSerializer):
    difficulty = DifficultyTypeSerializer(read_only=True)

    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(),
        write_only=True,
        source="difficulty",
    )

    class Meta:
        model = Achievement
        fields = [
            "id",
            "name",
            "description",
            "difficulty",
            "difficulty_id",
            "condition_type",
            "condition_config",
            "is_hidden",
            "created_at",
        ]

    def validate(self, data):
        condition_type = data.get(
            "condition_type",
            getattr(self.instance, "condition_type", None),
        )

        config = data.get(
            "condition_config",
            getattr(self.instance, "condition_config", {}),
        ) or {}

        if not isinstance(config, dict):
            raise serializers.ValidationError(
                {"condition_config": "Must be JSON object"}
            )

        # helper
        def require_positive_int(field):
            value = config.get(field)
            if value is None:
                raise serializers.ValidationError(
                    {"condition_config": f"{field} required"}
                )
            try:
                value = int(value)
            except Exception:
                raise serializers.ValidationError(
                    {"condition_config": f"{field} must be integer"}
                )
            if value <= 0:
                raise serializers.ValidationError(
                    {"condition_config": f"{field} must be > 0"}
                )

        # --- TARGET BASED ---
        target_conditions = [
            "habit_days",
            "any_habit_days",
            "habit_streak",
            "any_habit_streak",
            "goal_completed",
            "goal_completed_by_period",
            "notes_count",
            "mood_logged_days",
            "specific_mood_count",
            "todo_completed",
            "xp_reached",
            "level_reached",
            "sobriety_duration",
            "any_sobriety_duration",
        ]

        if condition_type in target_conditions:
            require_positive_int("target")

        # --- HABIT SPECIFIC ---
        if condition_type in ["habit_days", "habit_streak"]:
            if not config.get("habit_id"):
                raise serializers.ValidationError(
                    {"condition_config": "habit_id required"}
                )

        # --- GOAL PERIOD ---
        if condition_type == "goal_completed_by_period":
            if config.get("period") not in ["weekly", "monthly", "yearly"]:
                raise serializers.ValidationError(
                    {"condition_config": "period must be weekly/monthly/yearly"}
                )

        # --- MOOD ---
        if condition_type == "specific_mood_count":
            if not config.get("mood"):
                raise serializers.ValidationError(
                    {"condition_config": "mood required"}
                )

        # --- TODO CATEGORY ---
        if condition_type == "todo_completed":
            # opcjonalne — ale jeśli jest to musi być int
            if "category_id" in config:
                try:
                    int(config["category_id"])
                except Exception:
                    raise serializers.ValidationError(
                        {"condition_config": "category_id must be integer"}
                    )

        # --- SOBRIETY ---
        if condition_type == "sobriety_duration":
            if not config.get("sobriety_id"):
                raise serializers.ValidationError(
                    {"condition_config": "sobriety_id required"}
                )

        if condition_type in ["sobriety_duration", "any_sobriety_duration"]:
            unit = config.get("unit", "days")
            if unit not in ["days", "months", "years"]:
                raise serializers.ValidationError(
                    {"condition_config": "unit must be days/months/years"}
                )

        # manual nie potrzebuje config

        return data

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    progress_percent = serializers.ReadOnlyField()

    class Meta:
        model = UserAchievement
        fields = [
            "id",
            "achievement",
            "current_value",
            "target_value",
            "progress_percent",
            "is_completed",
            "completed_at",
            "updated_at",
        ]        