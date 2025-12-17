from rest_framework import serializers
from .models import ModuleDefinition


class ModuleDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleDefinition
        fields = ["id", "module", "is_enabled"]
