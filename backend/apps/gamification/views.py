from rest_framework import generics
from .models import User, XPLog
from .serializers import (
    UserSerializer,
    XPLogSerializer,
)


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class XPLogList(generics.ListAPIView):
    queryset = XPLog.objects.all()
    serializer_class = XPLogSerializer

