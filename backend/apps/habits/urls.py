from django.urls import path
from .views import (
    HabitListCreate,
    HabitDetail,
    HabitDayToggleView,
    HabitMonthView,
    HabitStreakView,
)


urlpatterns = [
    path("", HabitListCreate.as_view(), name="habits"),
    path("<int:pk>/", HabitDetail.as_view(), name="habit-detail"),
    path("<int:habit_id>/toggle-day/", HabitDayToggleView.as_view(), name="habit-toggle-day"),
    path("month/", HabitMonthView.as_view(), name="habit-month"),
    path("streaks/", HabitStreakView.as_view(), name="habit-streaks"),
]