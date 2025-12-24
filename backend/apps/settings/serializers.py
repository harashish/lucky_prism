from rest_framework import serializers
from .models import ModuleDefinition, DashboardTile


class ModuleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleDefinition
        fields = ["id", "module", "is_enabled"]


class DashboardTileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardTile
        fields = ["id", "key", "name", "is_enabled", "module_dependency"]

        # żeby nie można było podmienić nazw
        read_only_fields = ["key", "name", "module_dependency"]