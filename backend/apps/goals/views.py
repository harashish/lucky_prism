from django.utils import timezone
from apps.gamification.services.xp_calculator import calculate_xp
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
import random
from django.db import models

from .models import Goal, GoalPeriod, GoalStep
from .serializers import (
    GoalSerializer,
    GoalPeriodSerializer,
    GoalStepSerializer,
)
from apps.gamification.utils import get_user


class GoalListCreate(generics.ListCreateAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        user = get_user()
        period = self.request.query_params.get("period")
        archived = self.request.query_params.get("archived")

        qs = Goal.objects.filter(user=user)

        # 🔥 auto-archiwizacja
        for goal in qs.filter(is_archived=False):
            if goal.has_period_expired():
                goal.archive()

        qs = qs.order_by("-created_at")

        if period:
            qs = qs.filter(period__name__iexact=period)

        if archived == "true":
            qs = qs.filter(is_archived=True)
        elif archived == "false":
            qs = qs.filter(is_archived=False)

        return qs


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
    
class ToggleArchiveGoalView(APIView):
    def post(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk, user=get_user())
        except Goal.DoesNotExist:
            return Response(
                {"detail": "Goal not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        goal.is_archived = not goal.is_archived
        goal.archived_at = timezone.now() if goal.is_archived else None
        goal.save(update_fields=["is_archived", "archived_at", "updated_at"])

        return Response(
            {
                "goal_id": goal.id,
                "is_archived": goal.is_archived,
            },
            status=status.HTTP_200_OK,
        )    
    
class AddGoalStepView(APIView):
    def post(self, request, pk):
        try:
            goal = Goal.objects.get(pk=pk, user=get_user())
        except Goal.DoesNotExist:
            return Response(
                {"detail": "Goal not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        title = request.data.get("title")
        if not title:
            return Response({"detail": "Title required"}, status=400)

        max_order = goal.steps.aggregate(models.Max("order"))["order__max"]
        next_order = 0 if max_order is None else max_order + 1

        step = GoalStep.objects.create(
            goal=goal,
            title=title,
            order=next_order,
        )

        return Response(GoalStepSerializer(step).data, status=201)    

class ToggleGoalStepView(APIView):
    def post(self, request, pk):
        try:
            step = GoalStep.objects.get(pk=pk, goal__user=get_user())
        except GoalStep.DoesNotExist:
            return Response(
                {"detail": "Step not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        step.is_completed = not step.is_completed
        step.save(update_fields=["is_completed"])

        return Response(
            {
                "step_id": step.id,
                "is_completed": step.is_completed,
            },
            status=status.HTTP_200_OK,
        )    
    
class UpdateDeleteGoalStepView(APIView):
    def patch(self, request, pk):
        try:
            step = GoalStep.objects.get(pk=pk, goal__user=get_user())
        except GoalStep.DoesNotExist:
            return Response({"detail": "Step not found."}, status=404)

        title = request.data.get("title")
        if title is not None:
            step.title = title
            step.save(update_fields=["title"])

        return Response(GoalStepSerializer(step).data)

    def delete(self, request, pk):
        try:
            step = GoalStep.objects.get(pk=pk, goal__user=get_user())
        except GoalStep.DoesNotExist:
            return Response({"detail": "Step not found."}, status=404)

        step.delete()
        return Response(status=204)    