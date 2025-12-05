# apps/habits/urls.py
from django.urls import path
from .views import HabitListCreate, HabitDetail, HabitTrackingListCreate

urlpatterns = [
    path("", HabitListCreate.as_view(), name="habits"),
    path("<int:pk>/", HabitDetail.as_view(), name="habit-detail"),
    path("tracking/", HabitTrackingListCreate.as_view(), name="habit-tracking"),
]
