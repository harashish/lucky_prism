from django.urls import path
from .views import (
    AddGoalStepView,
    GoalListCreate,
    GoalDetail,
    GoalPeriodList,
    CompleteGoalView,
    RandomGoalView,
    ToggleArchiveGoalView,
    ToggleGoalStepView,
    UpdateDeleteGoalStepView,
)

urlpatterns = [
    path("", GoalListCreate.as_view(), name="goals"),
    path("<int:pk>/", GoalDetail.as_view(), name="goal-detail"),
    path("<int:pk>/complete/", CompleteGoalView.as_view(), name="complete-goal"),
    path("periods/", GoalPeriodList.as_view(), name="goal-periods"),
    path("random/", RandomGoalView.as_view(), name="goal-random"),
    path("<int:pk>/archive/", ToggleArchiveGoalView.as_view(), name="toggle-archive-goal"),
    path("<int:pk>/steps/", AddGoalStepView.as_view(), name="add-goal-step"),
    path("steps/<int:pk>/toggle/", ToggleGoalStepView.as_view(), name="toggle-goal-step"),
    path("steps/<int:pk>/", UpdateDeleteGoalStepView.as_view(), name="update-delete-goal-step"),
]
