from rest_framework import serializers
from .models import MoodEntry
from apps.gamification.utils import get_user
from django.utils import timezone


class MoodEntrySerializer(serializers.ModelSerializer):
    xp_gained = serializers.IntegerField(read_only=True)

    class Meta:
        model = MoodEntry
        fields = [
            "id",
            "mood",
            "date",
            "time",
            "note",
            "xp_gained",
        ]

    def create(self, validated_data):
        validated_data["user"] = get_user()
        instance = super().create(validated_data)

        xp = instance.award_xp_if_needed()
        instance.xp_gained = xp

        return instance