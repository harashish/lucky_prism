# apps/notes/views.py
from rest_framework import generics
from .models import RandomNote
from .serializers import RandomNoteSerializer

class RandomNoteListCreate(generics.ListCreateAPIView):
    queryset = RandomNote.objects.all()
    serializer_class = RandomNoteSerializer

class RandomNoteDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = RandomNote.objects.all()
    serializer_class = RandomNoteSerializer
