from django.test import TestCase
from apps.gamification.services.xp_calculator import calculate_xp
from apps.gamification.services.level_calculator import calculate_level
from apps.gamification.models import User, XPLog


class XPServiceTests(TestCase):

    def test_calculate_xp_easy_returns_positive_value(self):
        xp = calculate_xp(module="habits", difficulty="easy")
        self.assertEqual(xp, 10)

    def test_calculate_xp_medium_greater_than_easy(self):
        xp_easy = calculate_xp(module="habits", difficulty="easy")
        xp_medium = calculate_xp(module="habits", difficulty="medium")
        self.assertEqual(xp_easy, 10)
        self.assertEqual(xp_medium, 20)
    def test_calculate_xp_respects_user_multiplier(self):
        user = User.objects.create(xp_multiplier=2.0)

        xp = calculate_xp(
            module="habits",
            difficulty="easy",
            user=user,
        )

        self.assertEqual(xp, 20)


class LevelCalculationTests(TestCase):

    def test_level_starts_from_one(self):
        self.assertEqual(calculate_level(0), 1)

    def test_level_increases_with_xp(self):
        self.assertGreaterEqual(calculate_level(500), calculate_level(0))


class UserAddXPTests(TestCase):

    def test_add_xp_updates_total_xp_and_level(self):
        user = User.objects.create()
        user.add_xp(xp=50, source="test")
        user.refresh_from_db()

        self.assertEqual(user.total_xp, 50)
        self.assertGreaterEqual(user.current_level, 1)

    def test_add_xp_creates_log(self):
        user = User.objects.create()
        user.add_xp(xp=10, source="test")

        self.assertEqual(XPLog.objects.count(), 1)

    def test_add_zero_xp_does_not_change_total_xp(self):
        user = User.objects.create()
        user.add_xp(xp=0, source="test")
        user.refresh_from_db()

        self.assertEqual(user.total_xp, 0)
