from django.urls import path
from .views import MoodListCreate, MoodDetail, MoodTypesView

urlpatterns = [
    path("", MoodListCreate.as_view()),
    path("<int:pk>/", MoodDetail.as_view()),
    path("types/", MoodTypesView.as_view()),
]