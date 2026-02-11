from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserSerializer
from apps.gamification.utils import get_user

class CurrentUserView(APIView):
    def get(self, request):
        user = get_user()
        return Response(UserSerializer(user).data)

    def patch(self, request):
        user = get_user()
        multiplier = request.data.get("xp_multiplier")

        if multiplier not in [0.5, 1.0, 1.5, 2.0]:
            return Response(
                {"detail": "Invalid multiplier"},
                status=400,
            )

        user.xp_multiplier = multiplier
        user.save(update_fields=["xp_multiplier", "updated_at"])

        return Response(UserSerializer(user).data)

