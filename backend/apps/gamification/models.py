from django.db import models
from apps.gamification.services.level_calculator import calculate_level


class User(models.Model):
    """
    Jedyny użytkownik aplikacji.
    XP jest naliczane horyzontalnie przez inne moduły.
    """

    total_xp = models.BigIntegerField(default=0)
    current_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def add_xp(self, *, xp: int, source: str, source_id: int | None = None):
        """
        Dodaje XP użytkownikowi.
        XP MUSI być wcześniej policzone przez xp_calculator.
        """

        self.total_xp += xp
        self.current_level = calculate_level(self.total_xp)
        self.save(update_fields=["total_xp", "current_level", "updated_at"])

        XPLog.objects.create(
            user=self,
            source=source,
            source_id=source_id,
            xp=xp,
        )

        return {
            "xp_gained": xp,
            "total_xp": self.total_xp,
            "current_level": self.current_level,
        }


class XPLog(models.Model):
    """
    Log pojedynczego przyznania XP.
    Służy do audytu i ewentualnej wizualizacji progresu.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=30)  # habits, todos, challenges, goals, random
    source_id = models.IntegerField(null=True, blank=True)
    xp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
