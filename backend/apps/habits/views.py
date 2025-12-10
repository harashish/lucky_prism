# apps/habits/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import Habit, HabitDay
from .serializers import HabitSerializer, HabitDaySerializer
from apps.gamification.models import User
from datetime import datetime, date
import calendar

class HabitListCreate(generics.ListCreateAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class UserHabitList(generics.ListAPIView):
    serializer_class = HabitSerializer

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")
        return Habit.objects.filter(user_id=user_id, is_active=True).order_by("-created_at")

class HabitDayToggleView(APIView):
    """
    POST /habits/<habit_id>/toggle-day/
    payload: { "date": "YYYY-MM-DD", "status": 2 }  # status as int: 2 completed, 1 skipped, 0 empty
    If no payload date -> defaults to today.

    Behavior:
    - Creates or updates HabitDay.status
    - If marking completed (2) and xp_awarded == False => awards XP once and sets xp_awarded True
    - If changing from completed -> non-completed, we DO NOT remove previously awarded XP (to keep logs consistent) — this is deliberate.
    """
    def post(self, request, habit_id):
        date_str = request.data.get("date")
        try:
            status_val = int(request.data.get("status", HabitDay.STATUS_COMPLETED))
        except Exception:
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                return Response({"detail": "Invalid date format, use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            d = date.today()

        try:
            habit = Habit.objects.get(pk=habit_id)
        except Habit.DoesNotExist:
            return Response({"detail": "Habit not found."}, status=status.HTTP_404_NOT_FOUND)

        # create or update HabitDay atomically
        with transaction.atomic():
            obj, created = HabitDay.objects.select_for_update().get_or_create(
                habit=habit, date=d,
                defaults={"status": status_val, "xp_awarded": False}
            )
            xp_added = 0

            if not created:
                # set status
                prev_status = obj.status
                obj.status = status_val
                obj.save(update_fields=["status", "updated_at"])

            # award XP only if we set status to COMPLETED and xp_awarded was False
            if status_val == HabitDay.STATUS_COMPLETED and not obj.xp_awarded:
                xp_amount = habit.difficulty.xp_value if habit.difficulty else 0
                # award xp via user.add_xp
                total_xp, current_level = habit.user.add_xp(amount=int(xp_amount), source="habit", source_id=habit.id)
                xp_added = int(xp_amount)
                # mark xp_awarded True
                obj.xp_awarded = True
                obj.save(update_fields=["xp_awarded"])

        serializer = HabitDaySerializer(obj)
        return Response({"day": serializer.data, "xp_added": xp_added}, status=status.HTTP_200_OK)

class HabitMonthView(APIView):
    """
    GET /habits/<user_id>/month/?month=YYYY-MM
    Returns all habits for user and their days for given month.
    Response:
    {
      "habits": [ { habit info ... , "days": [ {date, status, xp_awarded}, ... ] }, ... ],
      "month": "YYYY-MM",
      "first_day": "YYYY-MM-DD",
      "last_day": "YYYY-MM-DD"
    }
    """
    def get(self, request, user_id):
        month_q = request.query_params.get("month")
        if not month_q:
            today = date.today()
            month_q = f"{today.year}-{today.month:02d}"
        try:
            year, mon = [int(x) for x in month_q.split("-")]
        except Exception:
            return Response({"detail": "Invalid month param, use YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)

        _, last_day = calendar.monthrange(year, mon)
        first_date = date(year, mon, 1)
        last_date = date(year, mon, last_day)

        habits = Habit.objects.filter(user_id=user_id, is_active=True)
        result = []
        for h in habits:
            days_qs = HabitDay.objects.filter(habit=h, date__range=(first_date, last_date))
            days_map = {hd.date.isoformat(): {"status": hd.status, "xp_awarded": hd.xp_awarded} for hd in days_qs}
            days = []
            for day in range(1, last_day + 1):
                d = date(year, mon, day)
                val = days_map.get(d.isoformat(), {"status": HabitDay.STATUS_EMPTY, "xp_awarded": False})
                days.append({"date": d.isoformat(), "status": val["status"], "xp_awarded": val["xp_awarded"]})
            habit_ser = HabitSerializer(h).data
            habit_ser["days"] = days
            result.append(habit_ser)

        return Response({
            "habits": result,
            "month": month_q,
            "first_day": first_date.isoformat(),
            "last_day": last_date.isoformat()
        }, status=status.HTTP_200_OK)
