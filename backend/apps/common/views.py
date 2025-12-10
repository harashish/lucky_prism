# apps/common/views.py
from rest_framework import generics
from .models import DifficultyType
from .serializers import DifficultyTypeSerializer

class DifficultyTypeList(generics.ListAPIView):
    """
    GET /api/common/difficulties/ -> lista difficulty types
    (możesz ewentualnie zmienić na ListCreateAPIView jeśli chcesz możliwość dodawania)
    """
    queryset = DifficultyType.objects.all().order_by('xp_value')
    serializer_class = DifficultyTypeSerializer


