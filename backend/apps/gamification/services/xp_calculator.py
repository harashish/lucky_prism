# apps/gamification/services/xp_calculator.py

from apps.gamification.config.xp_config import (
    BASE_XP,
    MODULE_MULTIPLIER,
    CHALLENGE_PERIOD_MULTIPLIER,
    GOAL_PERIOD_MULTIPLIER,
)

def calculate_xp(
    *,
    module: str,
    difficulty: str,
    period: str | None = None,
) -> int:
    """
    JEDYNE miejsce liczenia XP w systemie.
    """

    base_xp = BASE_XP[difficulty]
    xp = base_xp * MODULE_MULTIPLIER[module]

    if module == "challenges":
        if not period:
            raise ValueError("Challenge requires period")
        xp *= CHALLENGE_PERIOD_MULTIPLIER[period]

    if module == "goals":
        if not period:
            raise ValueError("Goal requires period")
        xp *= GOAL_PERIOD_MULTIPLIER[period]

    return int(xp)
