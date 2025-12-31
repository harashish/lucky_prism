from django.test import TestCase
from apps.challenges.models import ChallengeDefinition, ChallengeType, UserChallenge
from apps.common.models import DifficultyType
from apps.gamification.models import User
from rest_framework.test import APIClient


class UserChallengeUnitTests(TestCase):

    def setUp(self):
        self.user = User.objects.create()
        self.diff = DifficultyType.objects.create(name="easy", order=1)
        self.type = ChallengeType.objects.create(name="daily")

        self.definition = ChallengeDefinition.objects.create(
            title="Test challenge",
            difficulty=self.diff,
            type=self.type
        )

    def test_complete_awards_xp_once(self):
        uc = UserChallenge.objects.create(
            user=self.user,
            definition=self.definition,
            challenge_type=self.type
        )

        xp_first = uc.complete()
        xp_second = uc.complete()

        self.assertGreater(xp_first, 0)
        self.assertIsNone(xp_second)

    def test_complete_sets_completed_flag(self):
        uc = UserChallenge.objects.create(
            user=self.user,
            definition=self.definition,
            challenge_type=self.type
        )

        uc.complete()
        uc.refresh_from_db()

        self.assertTrue(uc.is_completed)


class ChallengeIntegrationTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create()
        self.diff = DifficultyType.objects.create(name="easy", order=1)
        self.type = ChallengeType.objects.create(name="daily")

        self.definition = ChallengeDefinition.objects.create(
            title="Test challenge",
            difficulty=self.diff,
            type=self.type
        )

    def test_complete_challenge_awards_xp(self):
        assign_res = self.client.post(
            "/api/challenges/assign/",
            {"challenge": self.definition.id},
            format="json"
        )
        self.assertIn(assign_res.status_code, [200, 201])

        user_challenge_id = assign_res.data["id"]

        complete_res = self.client.post(
            f"/api/challenges/user-challenges/{user_challenge_id}/complete/",
            format="json"
        )

        self.assertEqual(complete_res.status_code, 200)

        self.user.refresh_from_db()
        self.assertGreater(self.user.total_xp, 0)