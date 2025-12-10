# apps/challenges/serializers.py
from rest_framework import serializers
from .models import ChallengeDefinition, ChallengeTag, ChallengeType, UserChallenge
from apps.common.models import DifficultyType
from apps.common.serializers import DifficultyTypeSerializer


class ChallengeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeTag
        fields = ['id', 'name']

class ChallengeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeType
        fields = ['id', 'name']

'''class DifficultyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DifficultyType
        fields = ['id', 'name', 'xp_value']'''

class ChallengeDefinitionSerializer(serializers.ModelSerializer):
    type = ChallengeTypeSerializer(read_only=True)
    difficulty = DifficultyTypeSerializer(read_only=True)
    tags = ChallengeTagSerializer(many=True, read_only=True)

    # dodajemy pola do wpisywania ID przy tworzeniu
    type_id = serializers.PrimaryKeyRelatedField(
        queryset=ChallengeType.objects.all(), write_only=True, source='type'
    )
    difficulty_id = serializers.PrimaryKeyRelatedField(
        queryset=DifficultyType.objects.all(), write_only=True, source='difficulty'
    )
    tags_ids = serializers.PrimaryKeyRelatedField(
        queryset=ChallengeTag.objects.all(), many=True, write_only=True, required=False, source='tags'
    )

    class Meta:
        model = ChallengeDefinition
        fields = [
            'id', 'title', 'description', 'difficulty', 'type', 'tags', 'is_default',
            'type_id', 'difficulty_id', 'tags_ids'
        ]

    def create(self, validated_data):
        # wyciągamy i przypisujemy tags osobno
        tags_data = validated_data.pop('tags', [])
        challenge = ChallengeDefinition.objects.create(**validated_data)
        if tags_data:
            challenge.tags.set(tags_data)
        return challenge
class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = serializers.SerializerMethodField()

    class Meta:
        model = UserChallenge
        fields = ["id", "challenge", "start_date"]

    def get_challenge(self, obj):
        from .serializers import ChallengeDefinitionSerializer
        return ChallengeDefinitionSerializer(obj.definition).data
