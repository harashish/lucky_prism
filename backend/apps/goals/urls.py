from django.urls import path
from .views import (
    GoalListCreate,
    GoalDetail,
    GoalPeriodList,
    CompleteGoalView,
    RandomGoalView,
)

urlpatterns = [
    path("", GoalListCreate.as_view(), name="goals"),
    path("<int:pk>/", GoalDetail.as_view(), name="goal-detail"),
    path("<int:pk>/complete/", CompleteGoalView.as_view(), name="complete-goal"),
    path("periods/", GoalPeriodList.as_view(), name="goal-periods"),
    path("random/", RandomGoalView.as_view(), name="goal-random"),
]
