# apps/challenges/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from django.utils import timezone
from .models import ChallengeDefinition, ChallengeType, ChallengeTag, UserChallenge
from .serializers import ChallengeDefinitionSerializer, ChallengeTypeSerializer, DifficultyTypeSerializer, ChallengeTagSerializer, UserChallengeSerializer
from apps.common.models import DifficultyType
from apps.gamification.models import User

class ChallengeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer

class ChallengeTypeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeType.objects.all()
    serializer_class = ChallengeTypeSerializer

class ChallengeTagListCreate(generics.ListCreateAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer

# pojedynczy challenge
class ChallengeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer

# pojedynczy tag
class ChallengeTagDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer

    def destroy(self, request, *args, **kwargs):
        tag = self.get_object()
        if tag.challengedefinition_set.exists():  # jeśli tag jest używany
            return Response(
                {"detail": "Nie można usunąć tagu, który jest używany przez challenge."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
    

class CompleteUserChallengeView(APIView):
    def post(self, request, pk):
        try:
            user_challenge = UserChallenge.objects.get(pk=pk)
        except UserChallenge.DoesNotExist:
            return Response({"detail": "UserChallenge nie istnieje."}, status=status.HTTP_404_NOT_FOUND)

        user_challenge.complete()  # automatycznie dodaje XP i zapisuje historię

        return Response({
            "total_xp": user_challenge.user.total_xp,
            "current_level": user_challenge.user.current_level,
        }, status=status.HTTP_200_OK)
    

class AssignChallengeView(APIView):
    def post(self, request):
        user_id = request.data.get("user_id")
        challenge_id = request.data.get("challenge_id")

        # Pobranie usera i challengu
        try:
            user = User.objects.get(pk=user_id)
            challenge = ChallengeDefinition.objects.get(pk=challenge_id)
        except (User.DoesNotExist, ChallengeDefinition.DoesNotExist):
            return Response({"detail": "User or Challenge not found."}, status=status.HTTP_404_NOT_FOUND)

        # Szukamy istniejącego challenge
        user_challenge = UserChallenge.objects.filter(user=user, definition=challenge).first()
        
        if user_challenge:
            if hasattr(user_challenge, "is_completed") and user_challenge.is_completed:
                # jeśli ukończony, resetujemy i przypisujemy ponownie
                user_challenge.is_completed = False
                user_challenge.start_date = timezone.now().date()
                user_challenge.save()
                created = True
            else:
                # jeśli nadal aktywny, nic nie robimy
                created = False
        else:
            # jeśli nie istnieje, tworzymy nowy
            user_challenge = UserChallenge.objects.create(user=user, definition=challenge)
            created = True

        return Response({
            "id": user_challenge.id,
            "user": user.id,
            "challenge": challenge.id,
            "created": created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)



class UserChallengeList(generics.ListAPIView):
    serializer_class = UserChallengeSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return UserChallenge.objects.filter(user_id=user_id, is_completed=False)
