from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

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

    


'''class ModuleXPConfigList(generics.ListAPIView):
    queryset = ModuleXPConfig.objects.all()
    serializer_class = ModuleXPConfigSerializer'''


'''class AddXPView(APIView):
    def patch(self, request, pk):
        user = User.objects.get(pk=pk)

        xp = int(request.data.get("xp", 0))
        source = request.data.get("source", "")
        source_id = request.data.get("source_id")

        total_xp, current_level = user.add_xp(
            amount=xp,
            source=source,
            source_id=source_id,
        )

        return Response(
            {
                "total_xp": total_xp,
                "current_level": current_level,
            },
            status=status.HTTP_200_OK,
        )
'''