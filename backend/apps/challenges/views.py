from rest_framework import generics
from .models import ChallengeDefinition, ChallengeType, DifficultyType, ChallengeTag
from .serializers import ChallengeDefinitionSerializer, ChallengeTypeSerializer, DifficultyTypeSerializer, ChallengeTagSerializer

class ChallengeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer

class ChallengeTypeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeType.objects.all()
    serializer_class = ChallengeTypeSerializer

class DifficultyTypeListCreate(generics.ListCreateAPIView):
    queryset = DifficultyType.objects.all()
    serializer_class = DifficultyTypeSerializer

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
    
