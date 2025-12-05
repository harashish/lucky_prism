# apps/gamification/views.py
from fastapi import Response
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, XPLog, ModuleDefinition
from .serializers import UserSerializer, XPLogSerializer, ModuleDefinitionSerializer

class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class XPLogList(generics.ListAPIView):
    queryset = XPLog.objects.all()
    serializer_class = XPLogSerializer

class ModuleDefinitionListCreate(generics.ListCreateAPIView):
    queryset = ModuleDefinition.objects.all()
    serializer_class = ModuleDefinitionSerializer

class AddXPView(APIView):
    def patch(self, request, pk):
        user = User.objects.get(pk=pk)
        xp = request.data.get("xp", 0)
        source = request.data.get("source", "")
        source_id = request.data.get("source_id", None)

        total_xp, current_level = user.add_xp(amount=int(xp), source=source, source_id=source_id)
        return Response({
            "total_xp": total_xp,
            "current_level": current_level
        }, status=status.HTTP_200_OK)