from rest_framework import generics
from .models import ModuleDefinition, DashboardTile, UserPreference
from .serializers import ModuleDefinitionSerializer, DashboardTileSerializer, UserPreferenceSerializer
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

class UserPreferenceList(generics.ListAPIView):
    serializer_class = UserPreferenceSerializer

    def get_queryset(self):
        user = get_user()

        # ensure default exists
        for key in [
            "hide_quick_add_difficulty",
            "hide_todo_completed_toggle",
            "default_todo_category_id",
        ]:
            UserPreference.objects.get_or_create(user=user, key=key)

        return UserPreference.objects.filter(user=user)


class UserPreferenceUpdate(generics.UpdateAPIView):
    queryset = UserPreference.objects.all()
    serializer_class = UserPreferenceSerializer    

from django.core import serializers as django_serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
import json

from apps.gamification.models import User, XPLog
from apps.habits.models import Habit, HabitDay
from apps.goals.models import Goal, GoalStep
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
from apps.mood.models import MoodEntry
from apps.sobriety.models import Sobriety, SobrietyRelapse
from apps.achievements.models import Achievement, UserAchievement

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

            "goal_steps": django_serializers.serialize(
                "json",
                GoalStep.objects.filter(goal__user=user),
            ),

            "user_challenges": django_serializers.serialize(
                "json",
                UserChallenge.objects.filter(user=user),
            ),

            "challenge_definitions": django_serializers.serialize(
                "json",
                ChallengeDefinition.objects.all(),  # jeśli single user
            ),

            "challenge_tags": django_serializers.serialize(
                "json",
                ChallengeTag.objects.all(),
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
            "mood_entries": django_serializers.serialize(
                "json",
                MoodEntry.objects.filter(user=user),
            ),
            "sobriety": django_serializers.serialize(
                "json",
                Sobriety.objects.filter(user=user),
            ),

            "sobriety_relapses": django_serializers.serialize(
                "json",
                SobrietyRelapse.objects.filter(sobriety__user=user),
            ),

            "achievements": django_serializers.serialize(
                "json",
                Achievement.objects.all(),   # global templates
            ),

            "user_achievements": django_serializers.serialize(
                "json",
                UserAchievement.objects.filter(user=user),
),
        }

        return Response(data, status=status.HTTP_200_OK)
    
class ImportDataView(APIView):
    def post(self, request):
        payload = request.data

        try:
            with transaction.atomic():
                user = get_user()

                # kasujemy dane usera
                XPLog.objects.filter(user=user).delete()
                HabitDay.objects.filter(habit__user=user).delete()
                Habit.objects.filter(user=user).delete()
                GoalStep.objects.filter(goal__user=user).delete()
                Goal.objects.filter(user=user).delete()
                UserChallenge.objects.filter(user=user).delete()
                TodoTask.objects.filter(user=user).delete()
                RandomNote.objects.filter(user=user).delete()
                ModuleDefinition.objects.filter(user=user).delete()
                DashboardTile.objects.filter(user=user).delete()
                SobrietyRelapse.objects.filter(sobriety__user=user).delete()
                Sobriety.objects.filter(user=user).delete()
                UserAchievement.objects.filter(user=user).delete()

                # reset XP
                user.total_xp = 0
                user.current_level = 1
                user.save()

                # --- import w bezpiecznej kolejności ---

                if payload.get("habits"):
                    for obj in django_serializers.deserialize("json", payload["habits"]):
                        obj.save()

                if payload.get("habit_days"):
                    for obj in django_serializers.deserialize("json", payload["habit_days"]):
                        obj.save()

                if payload.get("goals"):
                    for obj in django_serializers.deserialize("json", payload["goals"]):
                        obj.save()

                if payload.get("goal_steps"):
                    for obj in django_serializers.deserialize("json", payload["goal_steps"]):
                        obj.save()

                if payload.get("xp_logs"):
                    for obj in django_serializers.deserialize("json", payload["xp_logs"]):
                        obj.save()

                if payload.get("user_challenges"):
                    for obj in django_serializers.deserialize("json", payload["user_challenges"]):
                        obj.save()

                if payload.get("todo_tasks"):
                    for obj in django_serializers.deserialize("json", payload["todo_tasks"]):
                        obj.save()

                if payload.get("notes"):
                    for obj in django_serializers.deserialize("json", payload["notes"]):
                        obj.save()

                if payload.get("module_settings"):
                    for obj in django_serializers.deserialize("json", payload["module_settings"]):
                        obj.save()

                if payload.get("dashboard_tiles"):
                    for obj in django_serializers.deserialize("json", payload["dashboard_tiles"]):
                        obj.save()
                        
                if payload.get("mood_entries"):
                    for obj in django_serializers.deserialize("json", payload["mood_entries"]):
                        obj.save()        

                if payload.get("sobriety"):
                    for obj in django_serializers.deserialize("json", payload["sobriety"]):
                        obj.save()

                if payload.get("sobriety_relapses"):
                    for obj in django_serializers.deserialize("json", payload["sobriety_relapses"]):
                        obj.save()

                if payload.get("user_achievements"):
                    for obj in django_serializers.deserialize("json", payload["user_achievements"]):
                        obj.save()        

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"detail": "Import successful"}, status=200)    