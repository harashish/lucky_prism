from rest_framework import serializers
from .models import DifficultyType

class DifficultyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DifficultyType
        fields = ['id', 'name', 'xp_value']


        

        