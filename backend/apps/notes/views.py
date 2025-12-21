from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import RandomNote
from .serializers import RandomNoteSerializer
import random

USER_ID = 1

class NotesListCreateView(generics.ListCreateAPIView):
    serializer_class = RandomNoteSerializer

    def get_queryset(self):
        return RandomNote.objects.filter(user_id=USER_ID).order_by("-updated_at")

    def perform_create(self, serializer):
        serializer.save(user_id=USER_ID)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RandomNote.objects.all()
    serializer_class = RandomNoteSerializer


class RandomNoteView(APIView):
    def get(self, request):
        qs = RandomNote.objects.filter(user_id=USER_ID)
        if not qs.exists():
            return Response(None, status=status.HTTP_200_OK)

        note = random.choice(list(qs))
        return Response(RandomNoteSerializer(note).data)
