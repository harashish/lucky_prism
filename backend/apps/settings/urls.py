from django.urls import path
from .views import (
    ModuleDefinitionList,
    ModuleDefinitionUpdate,
    DashboardTileList, 
    DashboardTileUpdate,
    UserPreferenceList,
    UserPreferenceUpdate
)
from .views import ExportDataView, ImportDataView

urlpatterns = [
    path("modules/", ModuleDefinitionList.as_view(), name="modules-list"),
    path("dashboard-tiles/", DashboardTileList.as_view(), name="dashboard-tiles"),
    path("dashboard-tiles/<int:pk>/", DashboardTileUpdate.as_view(), name="dashboard-tile-update"),
    path("modules/<int:pk>/", ModuleDefinitionUpdate.as_view(), name="modules-update"),
    path("export/", ExportDataView.as_view(), name="export-data"),
    path("import/", ImportDataView.as_view(), name="import-data"),

    path("preferences/", UserPreferenceList.as_view()),
    path("preferences/<int:pk>/", UserPreferenceUpdate.as_view()),
]

