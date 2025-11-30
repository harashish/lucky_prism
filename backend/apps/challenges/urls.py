from django.urls import path
from .views import ChallengeListCreate

urlpatterns = [
    path("challenges/", ChallengeListCreate.as_view(), name="challenges"),
]
