# apps/goals/urls.py
from django.urls import path
from .views import GoalListCreate, GoalDetail, GoalHistoryList, GoalPeriodList

urlpatterns = [
    path("", GoalListCreate.as_view(), name="goals"),
    path("<int:pk>/", GoalDetail.as_view(), name="goal-detail"),
    path("history/", GoalHistoryList.as_view(), name="goal-history"),
    path("periods/", GoalPeriodList.as_view(), name="goal-periods"),
]
