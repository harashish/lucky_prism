from django.db import models
from django.utils import timezone
from apps.gamification.services.xp_calculator import calculate_xp


class MoodEntry(models.Model):
    MOOD_CHOICES = [
        ("great", "Great"),
        ("good", "Good"),
        ("neutral", "Neutral"),
        ("bad", "Bad"),
        ("terrible", "Terrible"),
    ]

    user = models.ForeignKey("gamification.User", on_delete=models.CASCADE)
    mood = models.CharField(max_length=20, choices=MOOD_CHOICES)

    date = models.DateField()
    time = models.TimeField()

    note = models.TextField(blank=True)

    xp_awarded = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def award_xp_if_needed(self):
        if self.xp_awarded:
            return 0

        # logika difficulty
        difficulty = "medium" if self.note.strip() else "easy"

        xp = calculate_xp(
            module="mood",
            difficulty=difficulty,
            user=self.user,
        )

        self.user.add_xp(
            xp=xp,
            source="mood",
            source_id=self.id,
        )

        self.xp_awarded = True
        self.save(update_fields=["xp_awarded"])

        return xp