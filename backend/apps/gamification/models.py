from django.db import models
from apps.gamification.services.level_calculator import calculate_level

class User(models.Model):
    total_xp = models.BigIntegerField(default=0)
    current_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    xp_multiplier = models.FloatField(default=1.0)

    def add_xp(self, *, xp: int, source: str, source_id: int | None = None):

        # nic nie rób jeśli xp=0 (ważne)
        if xp <= 0:
            return {
                "xp_gained": 0,
                "total_xp": self.total_xp,
                "current_level": self.current_level,
            }

        self.total_xp += xp
        self.current_level = calculate_level(self.total_xp)
        self.save(update_fields=["total_xp", "current_level", "updated_at"])

        XPLog.objects.create(
            user=self,
            source=source,
            source_id=source_id,
            xp=xp,
        )

        # 🔥 achievement hook — lokalny import żeby uniknąć circular import
        from apps.achievements.services.achievement_engine import check_user_achievements
        check_user_achievements(self)

        return {
            "xp_gained": xp,
            "total_xp": self.total_xp,
            "current_level": self.current_level,
        }


class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=30)
    source_id = models.IntegerField(null=True, blank=True)
    xp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
