# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from apps.gamification.utils import get_user

class CurrentUserView(APIView):
    def get(self, request):
        user = get_user()
        return Response(UserSerializer(user).data)
