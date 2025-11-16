from rest_framework import serializers
from .models import ChallengeTemplate, UserChallenge

class ChallengeTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeTemplate
        fields = ['id', 'title', 'description', 'scope', 'difficulty', 'is_default']

class UserChallengeSerializer(serializers.ModelSerializer):
    template = ChallengeTemplateSerializer(read_only=True)
    template_id = serializers.PrimaryKeyRelatedField(
        queryset=ChallengeTemplate.objects.all(), source='template', write_only=True
    )

    class Meta:
        model = UserChallenge
        fields = ['id', 'template', 'template_id', 'assigned_at', 'completed', 'completed_at']
