from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChallengeTemplate, UserChallenge
from .serializers import ChallengeTemplateSerializer, UserChallengeSerializer
from django.shortcuts import get_object_or_404
import random

class ChallengeTemplateViewSet(viewsets.ModelViewSet):
    queryset = ChallengeTemplate.objects.all()
    serializer_class = ChallengeTemplateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # public defaults + user-created templates
        user = self.request.user
        qs = ChallengeTemplate.objects.filter(is_default=True)
        if user and user.is_authenticated:
            qs = qs | ChallengeTemplate.objects.filter(creator=user)
        return qs.distinct()

class UserChallengeViewSet(viewsets.ModelViewSet):
    serializer_class = UserChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserChallenge.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def draw(self, request):
        """
        Draw a random challenge (scope optional in payload)
        """
        scope = request.data.get('scope')  # 'daily' or 'weekly' or None
        qs = ChallengeTemplate.objects.filter(is_default=True)
        if scope in ['daily', 'weekly']:
            qs = qs.filter(scope=scope)
        all_templates = list(qs)
        if not all_templates:
            return Response({'detail': 'No templates found'}, status=status.HTTP_404_NOT_FOUND)
        chosen = random.choice(all_templates)
        uc = UserChallenge.objects.create(user=request.user, template=chosen)
        return Response(UserChallengeSerializer(uc).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        uc = get_object_or_404(UserChallenge, pk=pk, user=request.user)
        uc.completed = True
        from django.utils import timezone
        uc.completed_at = timezone.now()
        uc.save()
        return Response(UserChallengeSerializer(uc).data)
