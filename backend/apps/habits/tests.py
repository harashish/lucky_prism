from django.test import TestCase
from rest_framework.test import APIClient
from apps.gamification.models import User
from apps.common.models import DifficultyType
from apps.habits.models import Habit


class HabitIntegrationTests(TestCase):

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

        self.user.refresh_from_db()
        self.assertGreater(self.user.total_xp, 0)

    def test_habit_day_cannot_award_xp_twice(self):
        habit = Habit.objects.create(
            user=self.user,
            title="Meditation",
            difficulty=self.diff
        )

        url = f"/api/habits/{habit.id}/toggle-day/"

        self.client.post(url, data={}, format="json")
        self.user.refresh_from_db()
        xp_after_first = self.user.total_xp

        self.client.post(url, data={}, format="json")
        self.user.refresh_from_db()

        self.assertEqual(self.user.total_xp, xp_after_first)
