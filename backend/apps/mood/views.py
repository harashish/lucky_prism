from rest_framework import generics
from .models import MoodEntry
from .serializers import MoodEntrySerializer
from apps.gamification.utils import get_user


class MoodListCreate(generics.ListCreateAPIView):
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        year = self.request.query_params.get("year")
        qs = MoodEntry.objects.filter(user=get_user())

        if year:
            qs = qs.filter(date__year=year)

        return qs.order_by("date")


class MoodDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MoodEntrySerializer

    def get_queryset(self):
        return MoodEntry.objects.filter(user=get_user())