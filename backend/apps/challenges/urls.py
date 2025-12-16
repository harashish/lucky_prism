# apps/challenges/urls.py
from django.urls import path
from .views import (
    ChallengeListCreate,
    ChallengeDetail,
    ChallengeTagListCreate,
    ChallengeTypeListCreate,
    CompleteUserChallengeView,
    AssignChallengeView,
    UserChallengeList,
    RandomChallengeView,
    DiscardUserChallengeView,
    ActiveChallengesView,
    ChallengeTagDetail
)

urlpatterns = [
    path("", ChallengeListCreate.as_view()),
    path("<int:pk>/", ChallengeDetail.as_view()),
    path("tags/", ChallengeTagListCreate.as_view()),
    path("tags/<int:pk>/", ChallengeTagDetail.as_view(), name="tag-detail"),
    path("types/", ChallengeTypeListCreate.as_view()),
    path("assign/", AssignChallengeView.as_view()),
    path("random/", RandomChallengeView.as_view()),
    path("active/<int:user_id>/", ActiveChallengesView.as_view()),
    path("user-challenges/<int:pk>/complete/", CompleteUserChallengeView.as_view()),
    path("user-challenges/<int:pk>/discard/", DiscardUserChallengeView.as_view()),
    path("user-challenges/<int:user_id>/", UserChallengeList.as_view()),
]

