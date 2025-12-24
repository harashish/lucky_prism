from django.urls import path
from .views import (
    ModuleDefinitionList,
    ModuleDefinitionUpdate,
    DashboardTileList, 
    DashboardTileUpdate
)

urlpatterns = [
    path("modules/", ModuleDefinitionList.as_view(), name="modules-list"),
    path("dashboard-tiles/", DashboardTileList.as_view(), name="dashboard-tiles"),

    # włączenie/wyłączenie widoczności tile/module
    path("dashboard-tiles/<int:pk>/", DashboardTileUpdate.as_view(), name="dashboard-tile-update"),
    path("modules/<int:pk>/", ModuleDefinitionUpdate.as_view(), name="modules-update"),
]

