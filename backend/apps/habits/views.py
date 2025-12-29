from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from datetime import datetime, date
import calendar
import random

from .models import Habit, HabitDay
from .serializers import HabitSerializer, HabitDaySerializer
from apps.gamification.services.xp_calculator import calculate_xp
from apps.gamification.utils import get_user


class HabitListCreate(generics.ListCreateAPIView):
    serializer_class = HabitSerializer

    def get_queryset(self):
        return Habit.objects.filter(user=get_user(), is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=get_user())


class HabitDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer

    def get_queryset(self):
        return Habit.objects.filter(user=get_user())


class HabitDayToggleView(APIView):
    def post(self, request, habit_id):
        date_str = request.data.get("date")
        status_val = request.data.get("status")

        if date_str:
            try:
                d = datetime.strptime(date_str, "%Y-%m-%d").date()
            except Exception:
                return Response(
                    {"detail": "Invalid date format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            d = date.today()

        try:
            habit = Habit.objects.get(pk=habit_id, user=get_user())
        except Habit.DoesNotExist:
            return Response({"detail": "Habit not found"}, status=404)

        with transaction.atomic():
            obj, _ = HabitDay.objects.select_for_update().get_or_create(
                habit=habit,
                date=d,
                defaults={
                    "status": HabitDay.STATUS_EMPTY,
                    "xp_awarded": False,
                },
            )

            xp_added = 0
            already_completed = obj.status == HabitDay.STATUS_COMPLETED and obj.xp_awarded

            if status_val is None:
                if obj.status == HabitDay.STATUS_EMPTY:
                    new_status = HabitDay.STATUS_COMPLETED
                elif obj.status == HabitDay.STATUS_COMPLETED:
                    new_status = HabitDay.STATUS_SKIPPED
                else:
                    new_status = HabitDay.STATUS_EMPTY
            else:
                new_status = int(status_val)

            obj.status = new_status
            obj.save(update_fields=["status", "updated_at"])

            if new_status == HabitDay.STATUS_COMPLETED and not obj.xp_awarded:
                xp_amount = calculate_xp(
                    module="habits",
                    difficulty=habit.difficulty.name.lower(),
                    user=habit.user,
                )

                habit.user.add_xp(
                    xp=xp_amount,
                    source="habit",
                    source_id=obj.id,
                )

                obj.xp_awarded = True
                obj.save(update_fields=["xp_awarded"])
                xp_added = xp_amount

        return Response(
            {
                "day": HabitDaySerializer(obj).data,
                "xp_gained": xp_added,
                "total_xp": habit.user.total_xp,
                "current_level": habit.user.current_level,
                "already_completed": already_completed,
            },
            status=status.HTTP_200_OK,
        )


class HabitMonthView(APIView):
    def get(self, request):
        month_q = request.query_params.get("month")
        today = date.today()

        if not month_q:
            month_q = f"{today.year}-{today.month:02d}"

        try:
            year, mon = [int(x) for x in month_q.split("-")]
        except Exception:
            return Response(
                {"detail": "Invalid month"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        _, last_day = calendar.monthrange(year, mon)
        first_date = date(year, mon, 1)
        last_date = date(year, mon, last_day)

        habits = Habit.objects.filter(user=get_user(), is_active=True)
        result = []

        for h in habits:
            days_qs = HabitDay.objects.filter(
                habit=h,
                date__range=(first_date, last_date),
            )
            days_map = {hd.date: hd for hd in days_qs}

            days = []
            for day in range(1, last_day + 1):
                d = date(year, mon, day)
                hd = days_map.get(d)
                days.append(
                    {
                        "date": d.isoformat(),
                        "status": hd.status if hd else HabitDay.STATUS_EMPTY,
                        "xp_awarded": hd.xp_awarded if hd else False,
                    }
                )

            habit_data = HabitSerializer(h).data
            habit_data["days"] = days
            result.append(habit_data)

        return Response(
            {
                "habits": result,
                "month": month_q,
                "first_day": first_date.isoformat(),
                "last_day": last_date.isoformat(),
            }
        )


class HabitStreakView(APIView):
    def get(self, request):
        habits = Habit.objects.filter(user=get_user(), is_active=True)

        best = {
            "habit_id": None,
            "title": None,
            "biggest_streak": 0,
            "current_streak": 0,
        }

        for h in habits:
            days = HabitDay.objects.filter(habit=h).order_by("date")

            max_streak = 0
            cur = 0
            last_date = None

            for d in days:
                if d.status == HabitDay.STATUS_COMPLETED:
                    if last_date and (d.date - last_date).days == 1:
                        cur += 1
                    else:
                        cur = 1
                    max_streak = max(max_streak, cur)
                else:
                    cur = 0
                last_date = d.date

            current_streak = 0
            for d in reversed(days):
                if d.status == HabitDay.STATUS_COMPLETED:
                    current_streak += 1
                else:
                    break

            if max_streak > best["biggest_streak"]:
                best.update(
                    {
                        "habit_id": h.id,
                        "title": h.title,
                        "biggest_streak": max_streak,
                        "current_streak": current_streak,
                    }
                )

        return Response(best, status=status.HTTP_200_OK)

class RandomHabitSummaryView(APIView):
    def get(self, request):
        today = date.today()
        habits = Habit.objects.filter(user=get_user(), is_active=True)
        if not habits.exists():
            return Response(None, status=status.HTTP_200_OK)

        picked = random.choice(list(habits))
        _, last_day = calendar.monthrange(today.year, today.month)
        first_date = date(today.year, today.month, 1)
        last_date = date(today.year, today.month, last_day)

        days_qs = HabitDay.objects.filter(habit=picked, date__range=(first_date, last_date))
        done = days_qs.filter(status=HabitDay.STATUS_COMPLETED).count()

        summary = {
            "id": picked.id,
            "title": picked.title,
            "reason": picked.motivation_reason,
            "done": done,
            "total": last_day,
        }
        return Response(summary, status=status.HTTP_200_OK)