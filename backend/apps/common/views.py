from rest_framework import generics
from .models import DifficultyType
from .serializers import DifficultyTypeSerializer

class DifficultyTypeList(generics.ListAPIView):
    queryset = DifficultyType.objects.all().order_by('order')
    serializer_class = DifficultyTypeSerializer


