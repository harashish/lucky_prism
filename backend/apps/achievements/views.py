from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import models

from .models import Achievement, UserAchievement
from .serializers import (
    AchievementSerializer,
    UserAchievementSerializer,
)

from apps.gamification.utils import get_user


class AchievementListCreate(generics.ListCreateAPIView):
    serializer_class = AchievementSerializer

    def get_queryset(self):
        user = get_user()

        # systemowe + custom usera
        return Achievement.objects.filter(
            models.Q(user__isnull=True) | models.Q(user=user)
        )

    def perform_create(self, serializer):
        serializer.save(user=get_user())


class AchievementDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AchievementSerializer

    def get_queryset(self):
        user = get_user()
        return Achievement.objects.filter(
            models.Q(user__isnull=True) | models.Q(user=user)
        )        
    
class UserAchievementList(generics.ListAPIView):
    serializer_class = UserAchievementSerializer

    def get_queryset(self):
        return UserAchievement.objects.filter(
            user=get_user()
        ).select_related("achievement")    
    


class ManualUnlockAchievementView(APIView):
    def post(self, request, pk):
        user = get_user()

        try:
            achievement = Achievement.objects.get(pk=pk)
        except Achievement.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        if achievement.condition_type != "manual":
            return Response(
                {"detail": "Not a manual achievement"},
                status=400,
            )

        ua, created = UserAchievement.objects.get_or_create(
            user=user,
            achievement=achievement,
            defaults={
                "current_value": 1,
                "target_value": 1,
                "is_completed": True,
                "completed_at": timezone.now(),
            },
        )

        if not created and not ua.is_completed:
            ua.current_value = ua.target_value
            ua.is_completed = True
            ua.completed_at = timezone.now()
            ua.save()

        return Response(
            UserAchievementSerializer(ua).data,
            status=status.HTTP_200_OK,
        )    