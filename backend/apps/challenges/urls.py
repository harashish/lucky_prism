from rest_framework.routers import DefaultRouter
from .views import ChallengeTemplateViewSet, UserChallengeViewSet

router = DefaultRouter()
router.register(r'templates', ChallengeTemplateViewSet, basename='challenge-template')
router.register(r'user-challenges', UserChallengeViewSet, basename='user-challenge')

urlpatterns = router.urls
