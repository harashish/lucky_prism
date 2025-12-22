from rest_framework import serializers
from .models import ChallengeDefinition, ChallengeTag, ChallengeType, UserChallenge
from apps.common.models import DifficultyType
from apps.common.serializers import DifficultyTypeSerializer


class ChallengeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeTag
        fields = ["id", "name"]


class ChallengeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeType
        fields = ["id", "name"]


class ChallengeDefinitionSerializer(serializers.ModelSerializer):
    type = ChallengeTypeSerializer(read_only=True)
    difficulty = DifficultyTypeSerializer(read_only=True)
    tags = ChallengeTagSerializer(many=True, read_only=True)

    type_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=ChallengeType.objects.all(), source="type"
    )
    difficulty_id = serializers.PrimaryKeyRelatedField(
        write_only=True, queryset=DifficultyType.objects.all(), source="difficulty"
    )
    tags_ids = serializers.PrimaryKeyRelatedField(
        write_only=True, many=True, queryset=ChallengeTag.objects.all(), source="tags", required=False
    )

    class Meta:
        model = ChallengeDefinition
        fields = [
            "id", "title", "description",
            "difficulty", "type", "tags", "is_default",
            "type_id", "difficulty_id", "tags_ids"
        ]

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        instance = ChallengeDefinition.objects.create(**validated_data)
        instance.tags.set(tags)
        return instance


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = serializers.SerializerMethodField()
    progress_days = serializers.SerializerMethodField()

    class Meta:
        model = UserChallenge
        fields = [
            "id",
            "challenge",
            "challenge_type",
            "start_date",
            "weekly_deadline",
            "progress_days",
            "is_completed",
        ]

    def get_challenge(self, obj):
        return ChallengeDefinitionSerializer(obj.definition).data

    def get_progress_days(self, obj):
        return obj.weekly_progress_days

