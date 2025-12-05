# apps/goals/views.py
from rest_framework import generics
from .models import Goal, GoalHistory, GoalPeriod
from .serializers import GoalSerializer, GoalHistorySerializer, GoalPeriodSerializer

class GoalListCreate(generics.ListCreateAPIView):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer

class GoalDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer

class GoalHistoryList(generics.ListAPIView):
    queryset = GoalHistory.objects.all()
    serializer_class = GoalHistorySerializer

class GoalPeriodList(generics.ListAPIView):
    queryset = GoalPeriod.objects.all()
    serializer_class = GoalPeriodSerializer

