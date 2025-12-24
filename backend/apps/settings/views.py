from rest_framework import generics
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
        if instance.is_enabled:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=True)
        else:
            DashboardTile.objects.filter(user=instance.user, module_dependency=instance.module).update(is_enabled=False)

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

