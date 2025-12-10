# apps/goals/urls.py
from django.urls import path
from .views import (
    GoalListCreate,
    GoalDetail,
    GoalHistoryList,
    GoalPeriodList,
    UserGoalList,
    CompleteGoalView,
)

urlpatterns = [
    path("", GoalListCreate.as_view(), name="goals"),
    path("<int:pk>/", GoalDetail.as_view(), name="goal-detail"),
    path("history/", GoalHistoryList.as_view(), name="goal-history"),
    path("periods/", GoalPeriodList.as_view(), name="goal-periods"),
    path("user-goals/<int:user_id>/", UserGoalList.as_view(), name="user-goals"),
    path("<int:pk>/complete/", CompleteGoalView.as_view(), name="complete-goal"),
]
