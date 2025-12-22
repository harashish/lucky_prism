from django.test import TestCase
from apps.gamification.models import User
from apps.common.models import DifficultyType
from apps.todos.models import TodoCategory, TodoTask, TodoHistory

class TodoTests(TestCase):

    def test_completing_todo_awards_xp(self):
        # utwórz difficulty (bo to FK), kategorię, zadanie i historię
        diff = DifficultyType.objects.create(name="easy", order=1)
        user = User.objects.create()
        cat = TodoCategory.objects.create(name="General", difficulty=diff)
        task = TodoTask.objects.create(user=user, content="Test task", category=cat)

        # utwórz wpis historii i wywołaj complete() - użyta metoda z modeli
        hist = TodoHistory.objects.create(task=task, xp_gained=0)
        hist.complete()

        user.refresh_from_db()
        self.assertGreater(user.total_xp, 0)
