from apps.achievements.services.achievement_engine import check_user_achievements
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import RandomNote
from .serializers import RandomNoteSerializer
from apps.gamification.utils import get_user
import random

class NotesListCreateView(generics.ListCreateAPIView):
    serializer_class = RandomNoteSerializer

    def get_queryset(self):
        return RandomNote.objects.filter(
            user=get_user()
        ).order_by("-updated_at")

    def perform_create(self, serializer):
        note = serializer.save(user=get_user())
        check_user_achievements(get_user())

class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RandomNoteSerializer

    def get_queryset(self):
        return RandomNote.objects.filter(user=get_user())


class RandomNoteView(APIView):
    def get(self, request):
        qs = RandomNote.objects.filter(user=get_user())

        if not qs.exists():
            return Response(None, status=status.HTTP_200_OK)

        note = random.choice(qs)
        return Response(RandomNoteSerializer(note).data)
