from django.utils import timezone
from apps.achievements.models import Achievement, UserAchievement
from .condition_evaluator import evaluate_condition, get_target_value

def get_or_create_user_achievement(user, achievement):
    ua, created = UserAchievement.objects.get_or_create(
        user=user,
        achievement=achievement,
        defaults={
            "current_value": 0,
            "target_value": get_target_value(achievement),
            "is_completed": False,
        },
    )

    return ua

def update_user_achievement(user, achievement):
    ua = get_or_create_user_achievement(user, achievement)

    if ua.is_completed:
        return ua

    current_value = evaluate_condition(user, achievement)

    ua.current_value = current_value

    if current_value >= ua.target_value:
        ua.is_completed = True
        ua.completed_at = timezone.now()

    ua.save(update_fields=[
        "current_value",
        "is_completed",
        "completed_at",
        "updated_at",
    ])

    return ua


def check_user_achievements(user):
    """
    Sprawdza wszystkie achievementy usera.
    """

    achievements = Achievement.objects.filter(
        user__isnull=True
    ) | Achievement.objects.filter(user=user)

    updated = []

    for achievement in achievements:
        ua = update_user_achievement(user, achievement)

        if ua.is_completed:
            updated.append(ua)

    return updated