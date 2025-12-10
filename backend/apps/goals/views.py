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
    Działa bez auth (używamy user powiązanego z celem).
    Tworzy GoalHistory, dodaje XP do usera, zwraca total_xp i current_level.
    """
    def post(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk)
        except Goal.DoesNotExist:
            return Response({"detail": "Goal not found."}, status=status.HTTP_404_NOT_FOUND)

        difficulty_percent = 0
        if goal.difficulty:
            difficulty_percent = (goal.difficulty.xp_value or 0) / 100

        period_xp = goal.period.default_xp or 0

        xp = int(period_xp * difficulty_percent)


        # tworzymy historię i przypisujemy xp
        history = GoalHistory.objects.create(goal=goal, xp_gained=xp)
        total_xp, current_level = goal.user.add_xp(amount=int(xp), source="goal", source_id=goal.id)

        return Response({
            "goal_id": goal.id,
            "xp_gained": xp,
            "total_xp": total_xp,
            "current_level": current_level
        }, status=status.HTTP_200_OK)
