from django.utils import timezone
from apps.gamification.services.xp_calculator import calculate_xp
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
import random

from .models import Goal, GoalPeriod
from .serializers import (
    GoalSerializer,
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

        if goal.is_completed:
            return Response(
                {
                    "detail": "Goal already completed",
                    "already_completed": True,
                },
                status=status.HTTP_200_OK,
            )

        xp = calculate_xp(
            module="goals",
            difficulty=goal.difficulty.name.lower(),
            period=goal.period.name.lower(),
            user=goal.user,
        )

        goal.user.add_xp(
            xp=xp,
            source="goal",
            source_id=goal.id,
        )

        goal.is_completed = True
        goal.completed_at = timezone.now()
        goal.save(update_fields=["is_completed", "completed_at", "updated_at"])

        return Response(
            {
                "goal_id": goal.id,
                "xp_gained": xp,
                "total_xp": goal.user.total_xp,
                "current_level": goal.user.current_level,
            },
            status=status.HTTP_200_OK,
        )

class RandomGoalView(APIView):
    def get(self, request):
        period = request.GET.get("period")
        qs = Goal.objects.filter(user=get_user(), is_completed=False)
        if period:
            qs = qs.filter(period__name__iexact=period)

        if not qs.exists():
            return Response(None, status=status.HTTP_200_OK)

        picked = random.choice(list(qs))
        return Response(GoalSerializer(picked).data, status=status.HTTP_200_OK)