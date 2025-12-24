from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Goal, GoalHistory, GoalPeriod
from .serializers import (
    GoalSerializer,
    GoalHistorySerializer,
    GoalPeriodSerializer,
)
from apps.gamification.utils import get_user


class GoalListCreate(generics.ListCreateAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        period = self.request.query_params.get("period")
        qs = Goal.objects.filter(user=get_user()).order_by("-created_at")
        if period:
            qs = qs.filter(period__name__iexact=period)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=get_user())


class GoalDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=get_user())


class GoalHistoryList(generics.ListAPIView):
    serializer_class = GoalHistorySerializer

    def get_queryset(self):
        return GoalHistory.objects.filter(
            goal__user=get_user()
        ).order_by("-completion_date")


class GoalPeriodList(generics.ListAPIView):
    queryset = GoalPeriod.objects.all()
    serializer_class = GoalPeriodSerializer


class CompleteGoalView(APIView):
    def post(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk, user=get_user())
        except Goal.DoesNotExist:
            return Response(
                {"detail": "Goal not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        history = GoalHistory.objects.create(goal=goal)
        history.complete()

        return Response(
            {
                "goal_id": goal.id,
                "xp_gained": history.xp_gained,
                "total_xp": goal.user.total_xp,
                "current_level": goal.user.current_level,
            },
            status=status.HTTP_200_OK,
        )
