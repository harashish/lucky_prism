# apps/gamification/serializers.py
from rest_framework import serializers
from .models import User, XPLog, ModuleDefinition

class XPLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = XPLog
        fields = ['id', 'source', 'source_id', 'xp', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    logs = XPLogSerializer(many=True, read_only=True, source="xplog_set")

    class Meta:
        model = User
        fields = ['id', 'total_xp', 'current_level', 'created_at', 'updated_at', 'logs']

class ModuleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleDefinition
        fields = ['id', 'name', 'default_xp', 'is_enabled', 'user']
