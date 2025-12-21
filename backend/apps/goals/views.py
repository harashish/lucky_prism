# apps/goals/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Goal, GoalHistory, GoalPeriod
from .serializers import GoalSerializer, GoalHistorySerializer, GoalPeriodSerializer
from apps.common.models import DifficultyType
from apps.gamification.models import User

class GoalListCreate(generics.ListCreateAPIView):
    queryset = Goal.objects.all().order_by('-created_at')
    serializer_class = GoalSerializer

class GoalDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Goal.objects.all()
    serializer_class = GoalSerializer

class GoalHistoryList(generics.ListAPIView):
    queryset = GoalHistory.objects.all().order_by('-completion_date')
    serializer_class = GoalHistorySerializer

class GoalPeriodList(generics.ListAPIView):
    queryset = GoalPeriod.objects.all()
    serializer_class = GoalPeriodSerializer

# dodatkowe widoki
class UserGoalList(generics.ListAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        period = self.request.query_params.get("period")  # opcjonalne filtrowanie po nazwie: week/month/year
        qs = Goal.objects.filter(user_id=user_id).order_by('-created_at')
        if period:
            qs = qs.filter(period__name__iexact=period)
        return qs

class CompleteGoalView(APIView):
    """
    POST /goals/<pk>/complete/
    Tworzy GoalHistory, dodaje XP do usera (wewnątrz complete),
    zwraca aktualny stan użytkownika.
    """
    def post(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk)
        except Goal.DoesNotExist:
            return Response(
                {"detail": "Goal not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        history = GoalHistory.objects.create(goal=goal)
        result = history.complete()  # <-- TU dzieje się XP

        return Response({
            "goal_id": goal.id,
            "xp_gained": history.xp_gained,
            "total_xp": goal.user.total_xp,
            "current_level": goal.user.current_level,
        }, status=status.HTTP_200_OK)

