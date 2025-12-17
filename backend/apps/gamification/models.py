from django.db import models


from django.db import models

class User(models.Model):
    total_xp = models.BigIntegerField(default=0)
    current_level = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def add_xp(self, amount: int, source: str = "", source_id: int | None = None):
        final_xp = amount

        if source:
            # mapowanie nazw źródła na nazwy w ModuleXPConfig
            source_mapping = {
                "habit": "habits",
                "todo": "todos",
                "goal": "goals",
                "challenge": "challenges",
                "random": "random",
            }

            # dopasowanie do modułu w konfiguracji
            module_name = source_mapping.get(source, source)
            cfg = ModuleXPConfig.objects.filter(module=module_name).first()
            if cfg:
                final_xp = amount * cfg.multiplier

            # zachowujemy spójny source w logach
            source_for_log = module_name
        else:
            source_for_log = ""

        self.total_xp += final_xp

        new_level = self.calculate_level()
        if new_level > self.current_level:
            self.current_level = new_level

        self.save()

        XPLog.objects.create(
            user=self,
            source=source_for_log,
            source_id=source_id,
            xp=final_xp,
        )

        return self.total_xp, self.current_level

    def calculate_level(self):
        xp = self.total_xp
        level = 1
        while xp >= 100 * level:
            xp -= 100 * level
            level += 1
        return level



class XPLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=30)  # habit, challenge, todo, goal
    source_id = models.IntegerField(null=True)
    xp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class ModuleXPConfig(models.Model):
    MODULE_CHOICES = [
        ("habits", "Habits"),
        ("challenges", "Challenges"),
        ("todos", "Todos"),
        ("goals", "Goals"),
        ("random", "Random"),
    ]

    

    module = models.CharField(max_length=30, choices=MODULE_CHOICES, unique=True)
    multiplier = models.FloatField()

    def __str__(self):
        return f"{self.module}: {self.multiplier}xp"
