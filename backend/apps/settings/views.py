from rest_framework import generics
from .models import ModuleDefinition, DashboardTile
from .serializers import ModuleDefinitionSerializer, DashboardTileSerializer
from apps.gamification.utils import get_user

class ModuleDefinitionList(generics.ListAPIView):
    serializer_class = ModuleDefinitionSerializer

    def get_queryset(self):
        user = get_user()
        return ModuleDefinition.objects.filter(user=user).order_by("module")

'''class ModuleDefinitionUpdate(generics.UpdateAPIView):
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.is_enabled:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=True)
        else:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=False)'''

class ModuleDefinitionUpdate(generics.UpdateAPIView):
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

    def perform_update(self, serializer):
        instance = serializer.save()

        # automatyczne włączanie / wyłączanie tile zależnych od modułu
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

