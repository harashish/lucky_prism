from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

from .models import ModuleDefinition, DashboardTile
from .serializers import ModuleDefinitionSerializer, DashboardTileSerializer

class ModuleDefinitionList(generics.ListAPIView):
    serializer_class = ModuleDefinitionSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get("user_id")
        qs = ModuleDefinition.objects.all()
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs.order_by("module")


class ModuleDefinitionUpdate(generics.UpdateAPIView):
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        # jeśli wyłączono moduł -> wyłącz powiązane DashboardTile
        if instance.is_enabled:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=True)
        else:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=False)



class InitUserModules(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id required"}, status=400)

        defaults = [
            "habits",
            "challenges",
            "todos",
            "goals",
            "random",
            "gamification",
            "notes",
        ]

        created = []
        with transaction.atomic():
            for module in defaults:
                obj, was_created = ModuleDefinition.objects.get_or_create(
                    user_id=user_id,
                    module=module,
                    defaults={"is_enabled": True},
                )
                if was_created:
                    created.append(module)

        return Response({"created": created}, status=201)


from .models import ModuleDefinition, DashboardTile
from .serializers import ModuleDefinitionSerializer, DashboardTileSerializer

class DashboardTileList(generics.ListAPIView):
    serializer_class = DashboardTileSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get("user_id")
        qs = DashboardTile.objects.all()
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs.order_by("key")

class DashboardTileUpdate(generics.UpdateAPIView):
    queryset = DashboardTile.objects.all()
    serializer_class = DashboardTileSerializer

class InitUserDashboardTiles(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return Response({"detail": "user_id required"}, status=400)

        defaults = [
            ("level_gamification", "Level gamification", "gamification"),
            ("biggest_streak", "Biggest streak", "habits"),
            ("random_habit", "Random habit", "habits"),
            ("random_todo", "Random todo", "todos"),
            ("goal_week", "Week goal", "goals"),
            ("goal_month", "Month goal", "goals"),
            ("goal_year", "Year goal", "goals"),
            ("daily_challenge", "Daily challenge", "challenges"),
            ("weekly_challenge", "Weekly challenge", "challenges"),
            ("random_note", "Random note", "notes"),
        ]

        created = []
        with transaction.atomic():
            for key, name, module_dep in defaults:
                obj, was_created = DashboardTile.objects.get_or_create(
                    user_id=user_id,
                    key=key,
                    defaults={"name": name, "is_enabled": True, "module_dependency": module_dep},
                )
                if was_created:
                    created.append(key)

        return Response({"created": created}, status=201)
