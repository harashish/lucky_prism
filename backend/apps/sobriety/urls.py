from django.urls import path
from .views import (
    SobrietyListCreateView,
    SobrietyDetailView,
    SobrietyRelapseCreateView,
    SobrietyRestartView,
)

urlpatterns = [
    path("", SobrietyListCreateView.as_view(), name="sobriety-list"),
    path("<int:pk>/", SobrietyDetailView.as_view(), name="sobriety-detail"),
    path("<int:sobriety_id>/relapse/", SobrietyRelapseCreateView.as_view(), name="sobriety-relapse"),
    path("<int:sobriety_id>/restart/", SobrietyRestartView.as_view(), name="sobriety-restart"),
]