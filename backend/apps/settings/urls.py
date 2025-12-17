from django.urls import path
from .views import (
    ModuleDefinitionList,
    ModuleDefinitionUpdate,
    InitUserModules,
    DashboardTileList, DashboardTileUpdate, InitUserDashboardTiles

)

urlpatterns = [
    path("modules/", ModuleDefinitionList.as_view(), name="modules-list"),
    path("modules/<int:pk>/", ModuleDefinitionUpdate.as_view(), name="modules-update"),
    path("modules/init/", InitUserModules.as_view(), name="modules-init"),
    path("dashboard-tiles/", DashboardTileList.as_view(), name="dashboard-tiles"),
    path("dashboard-tiles/<int:pk>/", DashboardTileUpdate.as_view(), name="dashboard-tile-update"),
    path("dashboard-tiles/init/", InitUserDashboardTiles.as_view(), name="dashboard-tiles-init"),
]

