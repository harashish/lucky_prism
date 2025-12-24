from django.urls import path
from .views import UserDetail
urlpatterns = [
    path("users/<int:pk>/", UserDetail.as_view(), name="user-detail"),
]
