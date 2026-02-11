from rest_framework import generics
from .models import ModuleDefinition, DashboardTile
from .serializers import ModuleDefinitionSerializer, DashboardTileSerializer
from apps.gamification.utils import get_user

class ModuleDefinitionList(generics.ListAPIView):
    serializer_class = ModuleDefinitionSerializer

    def get_queryset(self):
        user = get_user()
        return ModuleDefinition.objects.filter(user=user).order_by("module")

class ModuleDefinitionUpdate(generics.UpdateAPIView):
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

    def perform_update(self, serializer):
        instance = serializer.save()

        DashboardTile.objects.filter(
            user=instance.user,
            module_dependency=instance.module
        ).update(is_enabled=instance.is_enabled)


class DashboardTileList(generics.ListAPIView):
    serializer_class = DashboardTileSerializer

    def get_queryset(self):
        user = get_user()
        return DashboardTile.objects.filter(user=user).order_by("key")


class DashboardTileUpdate(generics.UpdateAPIView):
    queryset = DashboardTile.objects.all()
    serializer_class = DashboardTileSerializer

from django.core import serializers as django_serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import json

from apps.gamification.models import User, XPLog
from apps.habits.models import Habit, HabitDay
from apps.goals.models import Goal
from apps.challenges.models import (
    ChallengeDefinition,
    ChallengeTag,
    ChallengeType,
    UserChallenge,
)
from apps.todos.models import TodoCategory, TodoTask
from apps.notes.models import RandomNote
from apps.common.models import DifficultyType
from apps.settings.models import ModuleDefinition, DashboardTile
from apps.gamification.utils import get_user

class ExportDataView(APIView):
    def get(self, request):
        user = get_user()

        data = {
            "user": django_serializers.serialize("json", [user]),
            "xp_logs": django_serializers.serialize(
                "json",
                XPLog.objects.filter(user=user),
            ),
            "habits": django_serializers.serialize(
                "json",
                Habit.objects.filter(user=user),
            ),
            "habit_days": django_serializers.serialize(
                "json",
                HabitDay.objects.filter(habit__user=user),
            ),
            "goals": django_serializers.serialize(
                "json",
                Goal.objects.filter(user=user),
            ),
            "challenges_definitions": django_serializers.serialize(
                "json",
                ChallengeDefinition.objects.all(),
            ),
            "challenge_tags": django_serializers.serialize(
                "json",
                ChallengeTag.objects.all(),
            ),
            "challenge_types": django_serializers.serialize(
                "json",
                ChallengeType.objects.all(),
            ),
            "user_challenges": django_serializers.serialize(
                "json",
                UserChallenge.objects.filter(user=user),
            ),
            "todo_categories": django_serializers.serialize(
                "json",
                TodoCategory.objects.all(),
            ),
            "todo_tasks": django_serializers.serialize(
                "json",
                TodoTask.objects.filter(user=user),
            ),
            "notes": django_serializers.serialize(
                "json",
                RandomNote.objects.filter(user=user),
            ),
            "module_settings": django_serializers.serialize(
                "json",
                ModuleDefinition.objects.filter(user=user),
            ),
            "dashboard_tiles": django_serializers.serialize(
                "json",
                DashboardTile.objects.filter(user=user),
            ),
            "difficulties": django_serializers.serialize(
                "json",
                DifficultyType.objects.all(),
            ),
        }

        return Response(data, status=status.HTTP_200_OK)
    
class ImportDataView(APIView):
    def post(self, request):
        payload = request.data

        try:
            with transaction.atomic():
                user = get_user()

                # czyścimy dane usera
                XPLog.objects.filter(user=user).delete()
                Habit.objects.filter(user=user).delete()
                Goal.objects.filter(user=user).delete()
                UserChallenge.objects.filter(user=user).delete()
                TodoTask.objects.filter(user=user).delete()
                RandomNote.objects.filter(user=user).delete()
                ModuleDefinition.objects.filter(user=user).delete()
                DashboardTile.objects.filter(user=user).delete()

                # opcjonalnie reset XP
                user.total_xp = 0
                user.current_level = 1
                user.save()

                # deserialize
                for key, json_data in payload.items():
                    if not json_data:
                        continue
                    objs = django_serializers.deserialize("json", json_data)
                    for obj in objs:
                        obj.save()

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Import successful"}, status=200)    