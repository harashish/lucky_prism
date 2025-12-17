# apps/habits/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from .models import Habit, HabitDay
from .serializers import HabitSerializer, HabitDaySerializer
from datetime import datetime, date, timedelta
from django.db.models import Q
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
    Toggle habit day status.
    Status cycle:
      EMPTY -> COMPLETED -> SKIPPED -> EMPTY

    XP:
    - awarded ONLY first time COMPLETED
    - NEVER removed
    """

    def post(self, request, habit_id):
        date_str = request.data.get("date")
        status_val = request.data.get("status")

        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                return Response({"detail": "Invalid date format"}, status=400)
        else:
            d = date.today()

        try:
            habit = Habit.objects.get(pk=habit_id)
        except Habit.DoesNotExist:
            return Response({"detail": "Habit not found"}, status=404)

        with transaction.atomic():
            obj, created = HabitDay.objects.select_for_update().get_or_create(
                habit=habit,
                date=d,
                defaults={"status": HabitDay.STATUS_EMPTY, "xp_awarded": False}
            )

            xp_added = 0
            already_completed = False

            # determine next status if not explicitly provided
            if status_val is None:
                if obj.status == HabitDay.STATUS_EMPTY:
                    new_status = HabitDay.STATUS_COMPLETED
                elif obj.status == HabitDay.STATUS_COMPLETED:
                    new_status = HabitDay.STATUS_SKIPPED
                else:
                    new_status = HabitDay.STATUS_EMPTY
            else:
                new_status = int(status_val)

            # XP logic
            if obj.status == HabitDay.STATUS_COMPLETED and obj.xp_awarded:
                already_completed = True

            obj.status = new_status
            obj.save(update_fields=["status", "updated_at"])

            if new_status == HabitDay.STATUS_COMPLETED and not obj.xp_awarded:
                xp_amount = habit.difficulty.xp_value if habit.difficulty else 0
                habit.user.add_xp(
                    amount=int(xp_amount),
                    source="habit",
                    source_id=obj.id
                )
                obj.xp_awarded = True
                obj.save(update_fields=["xp_awarded"])
                xp_added = int(xp_amount)

        return Response({
            "day": HabitDaySerializer(obj).data,
            "xp_added": xp_added,
            "already_completed": already_completed
        }, status=200)

class HabitMonthView(APIView):
    def get(self, request, user_id):
        month_q = request.query_params.get("month")
        if not month_q:
            today = date.today()
            month_q = f"{today.year}-{today.month:02d}"

        try:
            year, mon = [int(x) for x in month_q.split("-")]
        except Exception:
            return Response({"detail": "Invalid month"}, status=400)

        _, last_day = calendar.monthrange(year, mon)
        first_date = date(year, mon, 1)
        last_date = date(year, mon, last_day)

        habits = Habit.objects.filter(user_id=user_id, is_active=True)
        result = []

        for h in habits:
            days_qs = HabitDay.objects.filter(habit=h, date__range=(first_date, last_date))
            days_map = {hd.date.isoformat(): hd for hd in days_qs}

            days = []
            for day in range(1, last_day + 1):
                d = date(year, mon, day)
                hd = days_map.get(d.isoformat())
                days.append({
                    "date": d.isoformat(),
                    "status": hd.status if hd else HabitDay.STATUS_EMPTY,
                    "xp_awarded": hd.xp_awarded if hd else False
                })

            habit_ser = HabitSerializer(h).data
            habit_ser["days"] = days
            result.append(habit_ser)

        return Response({
            "habits": result,
            "month": month_q,
            "first_day": first_date.isoformat(),
            "last_day": last_date.isoformat()
        })

class UserHabitStreakView(APIView):
    """
    GET /api/habits/user-habits/<user_id>/streaks/
    Zwraca najlepszy streak: { habit_id, title, biggest_streak, current_streak }
    """
    def get(self, request, user_id):
        from .models import Habit, HabitDay
        habits = Habit.objects.filter(user_id=user_id, is_active=True)
        best = {"habit_id": None, "title": None, "biggest_streak": 0, "current_streak": 0}

        for h in habits:
            days = HabitDay.objects.filter(habit=h).order_by('date').values_list('date', 'status')
            max_streak = 0
            cur = 0
            last_date = None
            current_streak = 0

            for dt, status in days:
                if status == HabitDay.STATUS_COMPLETED:
                    if last_date and (dt - last_date).days == 1:
                        cur += 1
                    else:
                        cur = 1
                    if cur > max_streak: max_streak = cur
                else:
                    cur = 0
                last_date = dt

            # current streak (ending today): count backwards
            # quick compute: start from latest days until non-completed found
            cur_back = 0
            for dt, status in reversed(list(days)):
                if status == HabitDay.STATUS_COMPLETED:
                    cur_back += 1
                else:
                    break

            if max_streak > best["biggest_streak"]:
                best.update({"habit_id": h.id, "title": h.title, "biggest_streak": max_streak, "current_streak": cur_back})

        return Response(best, status=200)