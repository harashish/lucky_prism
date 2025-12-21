# apps/gamification/config/xp_config.py

BASE_XP = {
    "trivial": 0,
    "easy": 10,
    "medium": 20,
    "hard": 50,
}

MODULE_MULTIPLIER = {
    "habits": 1.0,
    "todos": 0.5,
    "challenges": 1.2,
    "goals": 1.5,
}

CHALLENGE_PERIOD_MULTIPLIER = {
    "daily": 1.0,
    "weekly": 1.5,
}

GOAL_PERIOD_MULTIPLIER = {
    "weekly": 1.0,
    "monthly": 3.0,
    "yearly": 8.0,
}

BASE_LEVEL_XP = 100
