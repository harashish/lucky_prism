from django.urls import path
from .views import (
    ChallengeListCreate,
    ChallengeDetail,
    ChallengeTagListCreate,
    ChallengeTagDetail,
    ChallengeTypeListCreate,
    AssignChallengeView,
    RandomChallengeView,
    ActiveChallengesView,
    CompleteUserChallengeView,
    DiscardUserChallengeView,
)

urlpatterns = [
    # --- challenge definitions ---
    path("", ChallengeListCreate.as_view(), name="challenge-list"),
    path("<int:pk>/", ChallengeDetail.as_view(), name="challenge-detail"),

    # --- tags ---
    path("tags/", ChallengeTagListCreate.as_view(), name="challenge-tags"),
    path("tags/<int:pk>/", ChallengeTagDetail.as_view(), name="challenge-tag-detail"),

    # --- types (daily / weekly) ---
    path("types/", ChallengeTypeListCreate.as_view(), name="challenge-types"),

    # --- user challenge actions ---
    path("assign/", AssignChallengeView.as_view(), name="challenge-assign"),
    path("random/", RandomChallengeView.as_view(), name="challenge-random"),
    path("active/", ActiveChallengesView.as_view(), name="challenge-active"),

    path(
        "user-challenges/<int:pk>/complete/",
        CompleteUserChallengeView.as_view(),
        name="user-challenge-complete",
    ),
    path(
        "user-challenges/<int:pk>/discard/",
        DiscardUserChallengeView.as_view(),
        name="user-challenge-discard",
    ),
]
