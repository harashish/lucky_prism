from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/challenges/", include("apps.challenges.urls")),
    path("api/gamification/", include("apps.gamification.urls")),
    path("api/habits/", include("apps.habits.urls")),
    path("api/goals/", include("apps.goals.urls")),
    path("api/notes/", include("apps.notes.urls")),
    path("api/todos/", include("apps.todos.urls")),
    path("api/common/", include("apps.common.urls")),
    path("api/settings/", include("apps.settings.urls")),
]

