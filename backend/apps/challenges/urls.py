# apps/challenges/urls.py
from django.urls import path
from .views import (
    ChallengeListCreate,
    ChallengeDetail,
    ChallengeTagListCreate,
    ChallengeTagDetail,
    ChallengeTypeListCreate,
    DifficultyTypeListCreate,
    CompleteUserChallengeView,
    AssignChallengeView,
    UserChallengeList,
)


urlpatterns = [
    path("", ChallengeListCreate.as_view(), name="challenges"),
    path("<int:pk>/", ChallengeDetail.as_view(), name="challenge-detail"),
    path("tags/", ChallengeTagListCreate.as_view(), name="challenge-tags"),
    path("tags/<int:pk>/", ChallengeTagDetail.as_view(), name="tag-detail"),
    path("types/", ChallengeTypeListCreate.as_view(), name="challenge-types"),
    path("difficulties/", DifficultyTypeListCreate.as_view(), name="difficulty-types"),
    path("user-challenges/<int:pk>/complete/", CompleteUserChallengeView.as_view(), name="complete-user-challenge"),
    path("assign/", AssignChallengeView.as_view(), name="assign-challenge"),
    path("user-challenges/<int:user_id>/", UserChallengeList.as_view(), name="user-challenges"),
]

