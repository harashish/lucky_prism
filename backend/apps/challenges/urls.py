from django.urls import path
from .views import (
    ChallengeListCreate,
    ChallengeDetail,
    ChallengeTagListCreate,
    ChallengeTagDetail,
    ChallengeTypeListCreate,
    DifficultyTypeListCreate,
)

urlpatterns = [
    path("challenges/", ChallengeListCreate.as_view(), name="challenges"),
    path("challenges/<int:pk>/", ChallengeDetail.as_view(), name="challenge-detail"),
    path("tags/<int:pk>/", ChallengeTagDetail.as_view(), name="tag-detail"),
    path("types/", ChallengeTypeListCreate.as_view(), name="challenge-types"),
    path("difficulties/", DifficultyTypeListCreate.as_view(), name="difficulty-types"),
    path("tags/", ChallengeTagListCreate.as_view(), name="challenge-tags"),
]
