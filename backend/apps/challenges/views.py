from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.utils import timezone
from datetime import timedelta
import random

from .models import (
    ChallengeDefinition,
    UserChallenge,
    ChallengeType,
    ChallengeTag,
)
from .serializers import (
    ChallengeDefinitionSerializer,
    ChallengeTypeSerializer,
    ChallengeTagSerializer,
    UserChallengeSerializer,
)
from apps.gamification.utils import get_user


class ActiveChallengesView(APIView):
    def get(self, request):
        user = get_user()

        daily = UserChallenge.objects.filter(
            user=user,
            is_completed=False,
            challenge_type__name="daily",
        ).first()

        weekly = UserChallenge.objects.filter(
            user=user,
            is_completed=False,
            challenge_type__name="weekly",
        )

        return Response(
            {
                "daily": UserChallengeSerializer(daily).data if daily else None,
                "weekly": UserChallengeSerializer(weekly, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

class AssignChallengeView(APIView):
    def post(self, request):
        user = get_user()
        challenge_id = request.data.get("challenge")

        try:
            definition = ChallengeDefinition.objects.get(pk=challenge_id)
        except ChallengeDefinition.DoesNotExist:
            return Response(
                {"detail": "Challenge not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        challenge_type = definition.type

        # --- block duplicates ---
        if challenge_type.name == "daily":
            if UserChallenge.objects.filter(
                user=user,
                challenge_type__name="daily",
                is_completed=False,
            ).exists():
                return Response(
                    {"detail": "Active daily challenge already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if challenge_type.name == "weekly":
            if UserChallenge.objects.filter(
                user=user,
                challenge_type__name="weekly",
                is_completed=False,
            ).exists():
                return Response(
                    {"detail": "Active weekly challenge already exists"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # --- reuse completed challenge ---
        existing = UserChallenge.objects.filter(
            user=user,
            definition=definition,
        ).first()

        if existing and existing.is_completed:
            existing.is_completed = False
            existing.start_date = timezone.now().date()
            existing.weekly_deadline = None
            existing.save(update_fields=["is_completed", "start_date", "weekly_deadline"])

            existing.start_weekly_if_needed()

            return Response(
                UserChallengeSerializer(existing).data,
                status=status.HTTP_200_OK,
            )

        # --- create new ---
        uc = UserChallenge.objects.create(
            user=user,
            definition=definition,
            challenge_type=challenge_type,
        )

        uc.start_weekly_if_needed()

        return Response(
            UserChallengeSerializer(uc).data,
            status=status.HTTP_201_CREATED,
        )


class RandomChallengeView(APIView):
    def get(self, request):
        user = get_user()
        type_name = request.GET.get("type")
        tags = request.GET.get("tags")

        qs = ChallengeDefinition.objects.all()

        if type_name:
            qs = qs.filter(type__name__iexact=type_name)

        if tags:
            tag_ids = [int(x) for x in tags.split(",") if x.strip()]
            qs = qs.filter(tags__in=tag_ids).distinct()

        active_defs = UserChallenge.objects.filter(
            user=user,
            is_completed=False,
        ).values_list("definition_id", flat=True)

        qs = qs.exclude(id__in=active_defs)

        if not qs.exists():
            return Response(
                {"error": "no_available"},
                status=status.HTTP_404_NOT_FOUND,
            )

        picked = random.choice(list(qs))
        return Response(
            ChallengeDefinitionSerializer(picked).data,
            status=status.HTTP_200_OK,
        )


class CompleteUserChallengeView(APIView):
    def post(self, request, pk):
        user = get_user()

        try:
            uc = UserChallenge.objects.get(pk=pk, user=user)
        except UserChallenge.DoesNotExist:
            return Response(
                {"detail": "Not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        xp = uc.complete()

        return Response(
            {
                "xp_gained": xp or 0,
                "total_xp": user.total_xp,
                "current_level": user.current_level,
            },
            status=status.HTTP_200_OK,
        )


class DiscardUserChallengeView(APIView):
    def post(self, request, pk):
        user = get_user()

        try:
            uc = UserChallenge.objects.get(pk=pk, user=user)
        except UserChallenge.DoesNotExist:
            return Response(
                {"detail": "Not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        uc.is_completed = True
        uc.save(update_fields=["is_completed", "updated_at"])

        return Response({"detail": "discarded"}, status=status.HTTP_200_OK)


class ChallengeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer


class ChallengeDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeDefinition.objects.all()
    serializer_class = ChallengeDefinitionSerializer


class ChallengeTagListCreate(generics.ListCreateAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer


class ChallengeTagDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ChallengeTag.objects.all()
    serializer_class = ChallengeTagSerializer

    def destroy(self, request, *args, **kwargs):
        tag = self.get_object()

        if ChallengeTag.objects.count() <= 1:
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


class ChallengeTypeListCreate(generics.ListCreateAPIView):
    queryset = ChallengeType.objects.all()
    serializer_class = ChallengeTypeSerializer

