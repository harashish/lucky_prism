from django.urls import path
from .views import (
    HabitListCreate,
    HabitDetail,
    UserHabitList,
    HabitDayToggleView,
    HabitMonthView,
    UserHabitStreakView
)

urlpatterns = [
    path("", HabitListCreate.as_view(), name="habits"),
    path("<int:pk>/", HabitDetail.as_view(), name="habit-detail"),
    path("user-habits/<int:user_id>/", UserHabitList.as_view(), name="user-habits"),
    path("<int:habit_id>/toggle-day/", HabitDayToggleView.as_view(), name="habit-toggle-day"),
    path("user-habits/<int:user_id>/month/", HabitMonthView.as_view(), name="habit-month"),
    path("user-habits/<int:user_id>/streaks/", UserHabitStreakView.as_view(), name="user-habits-streaks"),
]
