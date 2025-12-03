from rest_framework import serializers
from .models import ChallengeDefinition, ChallengeTag, ChallengeType, DifficultyType

class ChallengeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeTag
        fields = ['id', 'name']

class ChallengeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeType
        fields = ['id', 'name']

class DifficultyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DifficultyType
        fields = ['id', 'name', 'xp_value']

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
