from django.urls import path
from .views import (
    GoalListCreate,
    GoalDetail,
    GoalHistoryList,
    GoalPeriodList,
    CompleteGoalView,
)

urlpatterns = [
    path("", GoalListCreate.as_view(), name="goals"),
    path("<int:pk>/", GoalDetail.as_view(), name="goal-detail"),
    path("<int:pk>/complete/", CompleteGoalView.as_view(), name="complete-goal"),
    path("history/", GoalHistoryList.as_view(), name="goal-history"),
    path("periods/", GoalPeriodList.as_view(), name="goal-periods"),
]
