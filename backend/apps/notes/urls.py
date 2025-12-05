# apps/notes/urls.py
from django.urls import path
from .views import RandomNoteListCreate, RandomNoteDetail

urlpatterns = [
    path("", RandomNoteListCreate.as_view(), name="notes"),
    path("<int:pk>/", RandomNoteDetail.as_view(), name="note-detail"),
]
