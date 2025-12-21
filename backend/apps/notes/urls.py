from django.urls import path
from .views import NotesListCreateView, NoteDetailView, RandomNoteView

urlpatterns = [
    path("", NotesListCreateView.as_view()),
    path("random/", RandomNoteView.as_view()),
    path("<int:pk>/", NoteDetailView.as_view()),
]
