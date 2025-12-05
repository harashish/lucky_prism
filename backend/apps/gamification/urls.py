# apps/gamification/urls.py
from django.urls import path
from .views import UserDetail, XPLogList, ModuleDefinitionListCreate, AddXPView

urlpatterns = [
    path("users/<int:pk>/", UserDetail.as_view(), name="user-detail"),
    path("users/<int:pk>/add-xp/", AddXPView.as_view(), name="add-xp"),
    path("logs/", XPLogList.as_view(), name="xp-logs"),
    path("modules/", ModuleDefinitionListCreate.as_view(), name="modules"),
]
