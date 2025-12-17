from django.urls import path
from .views import (
    ModuleDefinitionList,
    ModuleDefinitionUpdate,
    InitUserModules,
)

urlpatterns = [
    path("modules/", ModuleDefinitionList.as_view(), name="modules-list"),
    path("modules/<int:pk>/", ModuleDefinitionUpdate.as_view(), name="modules-update"),
    path("modules/init/", InitUserModules.as_view(), name="modules-init"),
]
