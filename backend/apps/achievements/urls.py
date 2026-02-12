from django.urls import path
from .views import (
    AchievementListCreate,
    AchievementDetail,
    UserAchievementList,
    ManualUnlockAchievementView,
)

urlpatterns = [
    path("", AchievementListCreate.as_view()),
    path("<int:pk>/", AchievementDetail.as_view()),
    path("user/", UserAchievementList.as_view()),
    path("<int:pk>/unlock/", ManualUnlockAchievementView.as_view()),
]