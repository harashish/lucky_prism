from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import Sobriety, SobrietyRelapse
from .serializers import SobrietySerializer, SobrietyRelapseSerializer
from apps.gamification.utils import get_user


# LIST + CREATE
class SobrietyListCreateView(generics.ListCreateAPIView):
    serializer_class = SobrietySerializer

    def get_queryset(self):
        user = get_user()
        return Sobriety.objects.filter(user=user).order_by("-created_at")

    def perform_create(self, serializer):
        user = get_user()
        serializer.save(user=user)


# RETRIEVE + UPDATE + DELETE
class SobrietyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SobrietySerializer
    queryset = Sobriety.objects.all()


# RELAPSE CREATE
class SobrietyRelapseCreateView(APIView):
    def post(self, request, sobriety_id):
        try:
            sobriety = Sobriety.objects.get(id=sobriety_id)
        except Sobriety.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        serializer = SobrietyRelapseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(sobriety=sobriety)

            # automatycznie kończymy streak
            sobriety.is_active = False
            sobriety.ended_at = timezone.now()
            sobriety.save(update_fields=["is_active", "ended_at"])

            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


# RESTART SOBRIETY
class SobrietyRestartView(APIView):
    def post(self, request, sobriety_id):
        try:
            sobriety = Sobriety.objects.get(id=sobriety_id)
        except Sobriety.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        sobriety.started_at = timezone.now()
        sobriety.ended_at = None
        sobriety.is_active = True
        sobriety.save(update_fields=["started_at", "ended_at", "is_active"])

        return Response({"detail": "Restarted"}, status=200)