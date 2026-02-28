from rest_framework import serializers
from .models import ModuleDefinition, DashboardTile, UserPreference


class ModuleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleDefinition
        fields = ["id", "module", "is_enabled"]


class DashboardTileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardTile
        fields = ["id", "key", "name", "is_enabled", "module_dependency"]
        read_only_fields = ["key", "name", "module_dependency"]

from .models import UserPreference

class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ["id", "key", "value"]
        read_only_fields = ["key"]        