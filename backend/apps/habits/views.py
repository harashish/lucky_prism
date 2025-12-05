# apps/habits/views.py
from rest_framework import generics
from .models import Habit, HabitTracking
from .serializers import HabitSerializer, HabitTrackingSerializer

class HabitListCreate(generics.ListCreateAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class HabitTrackingListCreate(generics.ListCreateAPIView):
    queryset = HabitTracking.objects.all()
    serializer_class = HabitTrackingSerializer
