from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from datetime import timedelta
import random

from .models import ChallengeDefinition, UserChallenge, ChallengeType, ChallengeTag
from .serializers import (
    ChallengeDefinitionSerializer,
    ChallengeTypeSerializer,
    ChallengeTagSerializer,
    UserChallengeSerializer,
)
from apps.gamification.models import User

class ActiveChallengesView(APIView):
    def get(self, request, user_id):
        daily = UserChallenge.objects.filter(
            user_id=user_id,
            is_completed=False,
            challenge_type="Daily",
        ).first()

        weekly = list(
            UserChallenge.objects.filter(
                user_id=user_id,
                is_completed=False,
                challenge_type="Weekly",
            )
        )

        data = {
            "daily": UserChallengeSerializer(daily).data if daily else None,
            "weekly": UserChallengeSerializer(weekly, many=True).data,
        }

        return Response(data, status=200)

class AssignChallengeView(APIView):
    def post(self, request):
        user_id = request.data.get("user")
        challenge_id = request.data.get("challenge")

        try:
            user = User.objects.get(pk=user_id)
            definition = ChallengeDefinition.objects.get(pk=challenge_id)
        except:
            return Response({"detail": "User or Challenge not found"}, status=404)

        challenge_type = definition.type.name

        if challenge_type == "Daily":
            if UserChallenge.objects.filter(user=user, challenge_type="Daily", is_completed=False).exists():
                return Response({"detail": "Active daily challenge already exists"}, 
                                status=status.HTTP_400_BAD_REQUEST,
                )

        if challenge_type == "Weekly":
            if UserChallenge.objects.filter(user=user, challenge_type="Weekly", is_completed=False).exists():
                return Response({"detail": "Active weekly challenge already exists"}, 
                                status=status.HTTP_400_BAD_REQUEST,
                )


        existing = UserChallenge.objects.filter(user=user, definition=definition).first()

        if existing and existing.is_completed:
            existing.is_completed = False
            existing.start_date = timezone.now().date()

            if challenge_type == "Weekly":
                existing.weekly_deadline = existing.start_date + timedelta(days=7)

            existing.save()
            existing.start_weekly_if_needed()

            return Response(UserChallengeSerializer(existing).data, status=200)

        uc = UserChallenge.objects.create(
            user=user,
            definition=definition,
            challenge_type=challenge_type,
            start_date=timezone.now().date()
        )

        if challenge_type == "Weekly":
            uc.weekly_deadline = uc.start_date + timedelta(days=7)
            uc.save()

        uc.start_weekly_if_needed()

        return Response(UserChallengeSerializer(uc).data, status=201)

class RandomChallengeView(APIView):
    def get(self, request):
        type_name = request.GET.get("type")
        tags = request.GET.get("tags")
        user_id = request.GET.get("user_id")

        qs = ChallengeDefinition.objects.all()

        if type_name:
            qs = qs.filter(type__name__iexact=type_name)

        if tags:
            tag_ids = [int(x) for x in tags.split(",") if x.strip()]
            qs = qs.filter(tags__in=tag_ids).distinct()

        if user_id:
            active_defs = UserChallenge.objects.filter(
                user_id=user_id,
                is_completed=False
            ).values_list("definition_id", flat=True)
            qs = qs.exclude(id__in=active_defs)

        if not qs.exists():
            return Response({"error": "no_available"}, status=404)

        picked = random.choice(list(qs))
        return Response(ChallengeDefinitionSerializer(picked).data, status=200)

class CompleteUserChallengeView(APIView):
    def post(self, request, pk):
        try:
            uc = UserChallenge.objects.get(pk=pk)
        except UserChallenge.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        xp = uc.complete() or 0

        return Response({
            "xp_gained": xp,
            "total_xp": uc.user.total_xp,
            "current_level": uc.user.current_level
        }, status=status.HTTP_200_OK)

class DiscardUserChallengeView(APIView):
    def post(self, request, pk):
        try:
            uc = UserChallenge.objects.get(pk=pk)
        except:
            return Response({"detail": "Not found"}, status=404)

        uc.is_completed = True
        uc.save(update_fields=["is_completed", "updated_at"])

        return Response({"detail": "discarded"}, status=200)

class ChallengeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer

class ChallengeTagListCreate(generics.ListCreateAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer

class ChallengeTypeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeType.objects.all()
    serializer_class = ChallengeTypeSerializer

class UserChallengeList(generics.ListAPIView):
    serializer_class = UserChallengeSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return UserChallenge.objects.filter(user_id=user_id, is_completed=False)

class ChallengeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer


class ChallengeTagDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer

    def destroy(self, request, *args, **kwargs):
        tag = self.get_object()

        total_tags = ChallengeTag.objects.count()
        if total_tags <= 1:
            return Response(
                {"detail": "Cannot delete the last remaining tag."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ChallengeDefinition.objects.filter(tags=tag).exists():
            return Response(
                {"detail": "Cannot delete a tag assigned to challenges."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)
