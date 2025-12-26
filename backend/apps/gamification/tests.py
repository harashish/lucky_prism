from django.test import TestCase
from apps.gamification.services.xp_calculator import calculate_xp
from apps.gamification.services.level_calculator import calculate_level
from apps.gamification.models import User, XPLog

class GamificationTests(TestCase):

    def test_calculate_xp_easy_returns_positive_value(self):
        xp = calculate_xp(
            module="habits",
            difficulty="easy"
        )
        self.assertGreater(xp, 0)

    def test_calculate_level_increases_with_xp(self):
        level_1 = calculate_level(0)
        level_2 = calculate_level(500)
        self.assertGreaterEqual(level_2, level_1)

    def test_user_add_xp_updates_xp_and_level_and_creates_log(self):
        user = User.objects.create()

        result = user.add_xp(
            xp=50,
            source="test",
            source_id=1
        )

        user.refresh_from_db()

        self.assertEqual(user.total_xp, 50)
        self.assertGreaterEqual(user.current_level, 1)
        self.assertEqual(XPLog.objects.count(), 1)
        self.assertEqual(result["xp_gained"], 50)

    def test_user_add_zero_xp_does_not_change_state(self):
        user = User.objects.create()
        user.add_xp(xp=0, source="test")
        user.refresh_from_db()
        self.assertEqual(user.total_xp, 0)