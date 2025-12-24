from apps.gamification.models import User

def get_user():
    user = User.objects.first()
    if not user:
        user = User.objects.create()
    return user
