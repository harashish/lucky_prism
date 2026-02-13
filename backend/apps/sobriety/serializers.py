from rest_framework import serializers
from .models import Sobriety, SobrietyRelapse


class SobrietyRelapseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SobrietyRelapse
        fields = [
            "id",
            "sobriety",
            "occurred_at",
            "note",
        ]
        read_only_fields = ["id", "sobriety", "occurred_at"]


class SobrietySerializer(serializers.ModelSerializer):
    relapses = SobrietyRelapseSerializer(many=True, read_only=True)
    current_duration = serializers.SerializerMethodField()

    class Meta:
        model = Sobriety
        fields = [
            "id",
            "name",
            "description",
            "motivation_reason",
            "started_at",
            "ended_at",
            "is_active",
            "created_at",
            "updated_at",
            "current_duration",
            "relapses",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "current_duration",
        ]

    def get_current_duration(self, obj):
        duration = obj.current_duration()
        if duration:
            return int(duration.total_seconds())
        return None