from django.test import TestCase
from rest_framework.test import APIClient
from apps.gamification.models import User
from apps.common.models import DifficultyType
from apps.habits.models import Habit

class HabitTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.diff = DifficultyType.objects.create(name="easy", order=1)
        self.user = User.objects.create()

    def test_habit_day_completion_awards_xp(self):
        habit = Habit.objects.create(
            user=self.user,
            title="Meditation",
            difficulty=self.diff
        )

        url = f"/api/habits/{habit.id}/toggle-day/"
        res = self.client.post(url, data={}, format="json")
        self.assertEqual(res.status_code, 200)

        # po toggle powinien być przyznany XP
        self.user.refresh_from_db()
        self.assertGreater(self.user.total_xp, 0)

    def test_habit_day_cannot_award_xp_twice(self):
        habit = Habit.objects.create(
            user=self.user,
            title="Meditation",
            difficulty=self.diff
        )

        url = f"/api/habits/{habit.id}/toggle-day/"
        res1 = self.client.post(url, data={}, format="json")
        self.assertEqual(res1.status_code, 200)
        xp_after_first = self.user.total_xp

        # drugi toggle tego samego dnia nie powinien dodać XP
        res2 = self.client.post(url, data={}, format="json")
        self.assertEqual(res2.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.total_xp, xp_after_first)
