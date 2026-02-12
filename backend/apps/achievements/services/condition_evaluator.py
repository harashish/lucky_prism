from apps.habits.models import HabitDay
from apps.gamification.models import User
from apps.notes.models import RandomNote
from apps.mood.models import MoodEntry
from apps.goals.models import Goal
from django.utils import timezone

def get_target_value(achievement):
    config = achievement.condition_config or {}

    try:
        if "target" in config:
            return int(config["target"])

        # fallback legacy
        for key in ["days", "count", "xp", "level", "streak", "value"]:
            if key in config:
                return int(config[key])

    except (TypeError, ValueError):
        return 1

    return 1

def _calculate_habit_streak(days):
    """
    Zwraca biggest streak dla querysetu HabitDay.
    """

    max_streak = 0
    cur = 0
    last_date = None

    for d in days:
        if d.status == d.STATUS_COMPLETED:
            if last_date and (d.date - last_date).days == 1:
                cur += 1
            else:
                cur = 1
            max_streak = max(max_streak, cur)
        else:
            cur = 0

        last_date = d.date

    return max_streak

from apps.habits.models import Habit, HabitDay


def evaluate_habit_streak(user, achievement):
    """
    Zwraca biggest streak dla konkretnego habit.
    """

    config = achievement.condition_config or {}
    habit_id = config.get("habit_id")

    if not habit_id:
        return 0

    days = HabitDay.objects.filter(
        habit_id=habit_id,
        habit__user=user,
    ).order_by("date")

    return _calculate_habit_streak(days)

def evaluate_any_habit_streak(user, achievement):
    """
    Zwraca największy streak ze wszystkich habitów usera.
    """

    habits = Habit.objects.filter(
        user=user,
        is_active=True,
    )

    best = 0

    for habit in habits:
        days = HabitDay.objects.filter(
            habit=habit
        ).order_by("date")

        streak = _calculate_habit_streak(days)
        best = max(best, streak)

    return best


def evaluate_habit_days(user, achievement):
    config = achievement.condition_config
    habit_id = config.get("habit_id")

    qs = HabitDay.objects.filter(
        habit__user=user,
        status=HabitDay.STATUS_COMPLETED,
    )

    if habit_id:
        qs = qs.filter(habit_id=habit_id)

    return qs.count()

def evaluate_any_habit_days(user, achievement):
    return HabitDay.objects.filter(
        habit__user=user,
        status=HabitDay.STATUS_COMPLETED,
    ).count()

def evaluate_xp_reached(user, achievement):
    return user.total_xp

def evaluate_level_reached(user, achievement):
    return user.current_level

def evaluate_notes_count(user, achievement):
    return RandomNote.objects.filter(user=user).count()

def evaluate_mood_logged_days(user, achievement):
    return MoodEntry.objects.filter(user=user).count()

def evaluate_goal_completed(user, achievement):
    return Goal.objects.filter(
        user=user,
        is_completed=True,
    ).count()

def evaluate_goal_completed_by_period(user, achievement):
    """
    Zwraca liczbę ukończonych goalów dla danego period.
    """

    config = achievement.condition_config or {}
    period = config.get("period")

    if not period:
        return 0

    return Goal.objects.filter(
        user=user,
        is_completed=True,
        period__name=period,
    ).count()

def evaluate_specific_mood_count(user, achievement):
    """
    Liczy ile razy user zalogował konkretny mood.
    """

    config = achievement.condition_config or {}
    mood = config.get("mood")

    if not mood:
        return 0

    return MoodEntry.objects.filter(
        user=user,
        mood=mood,
    ).count()

def _duration_to_unit(delta, unit):
    seconds = delta.total_seconds()

    if unit == "days":
        return int(seconds // 86400)

    if unit == "months":
        return int(seconds // (86400 * 30))

    if unit == "years":
        return int(seconds // (86400 * 365))

    return 0

from apps.sobriety.models import Sobriety


def evaluate_sobriety_duration(user, achievement):
    """
    Duration konkretnego sobriety.
    """

    config = achievement.condition_config or {}
    sobriety_id = config.get("sobriety_id")
    unit = config.get("unit", "days")

    if not sobriety_id:
        return 0

    try:
        sobriety = Sobriety.objects.get(
            id=sobriety_id,
            user=user,
        )
    except Sobriety.DoesNotExist:
        return 0

    duration = sobriety.current_duration()

    if not duration:
        return 0

    return _duration_to_unit(duration, unit)

def evaluate_any_sobriety_duration(user, achievement):
    """
    Najdłuższy duration ze wszystkich sobriety usera.
    """

    config = achievement.condition_config or {}
    unit = config.get("unit", "days")

    soberities = Sobriety.objects.filter(user=user)

    best = 0

    for s in soberities:
        duration = s.current_duration()
        if not duration:
            continue

        value = _duration_to_unit(duration, unit)
        best = max(best, value)

    return best

from apps.todos.models import TodoTask

def evaluate_todo_completed(user, achievement):
    """
    Liczy ukończone todo usera.
    Opcjonalnie filtr po category_id.
    """

    config = achievement.condition_config or {}
    category_id = config.get("category_id")

    qs = TodoTask.objects.filter(
        user=user,
        is_completed=True,
    )

    if category_id:
        qs = qs.filter(category_id=category_id)

    return qs.count()


# w przyszłości dodać challenges
EVALUATORS = {

    "habit_days": evaluate_habit_days,
    "any_habit_days": evaluate_any_habit_days,
    "habit_streak": evaluate_habit_streak,
    "any_habit_streak": evaluate_any_habit_streak,

    "goal_completed": evaluate_goal_completed,
    "goal_completed_by_period": evaluate_goal_completed_by_period,

    "todo_completed": evaluate_todo_completed,

    "notes_count": evaluate_notes_count,

    "mood_logged_days": evaluate_mood_logged_days,
    "specific_mood_count": evaluate_specific_mood_count,

    "sobriety_duration": evaluate_sobriety_duration,
    "any_sobriety_duration": evaluate_any_sobriety_duration,

    "xp_reached": evaluate_xp_reached,
    "level_reached": evaluate_level_reached,
}

def evaluate_condition(user, achievement):
    evaluator = EVALUATORS.get(achievement.condition_type)

    if not evaluator:
        return 0

    return evaluator(user, achievement)

