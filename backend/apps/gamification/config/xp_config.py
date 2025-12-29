GLOBAL_XP_MULTIPLIERS = [0.5, 1.0, 1.5, 2.0]
DEFAULT_GLOBAL_XP_MULTIPLIER = 1.0

BASE_XP = {
    "trivial": 0,
    "easy": 10,
    "medium": 20,
    "hard": 50,
}

MODULE_MULTIPLIER = {
    "habits": 1.0,
    "todos": 0.5,
    # początkowo challenges miało mnoznik 1.2 ale nastąpiła zmiana, bo:
    # - 1.2 (wg poziomu trudnosci) -> w daily: 12,24,60
    # - 1.2 (wg poziomu trudnosci) -> w weekly: 18,36,90
    # czyli były to jedyne (tylko w hard były) liczby nie będące wielokrotnosciami 5
    # (oczywiscie tylko przy multiplier domyslnym czyli 1.0 (lub 2.0). przy 0.5 i 1.5 pojawiają sie w modułach liczby nie bedące wielokrotnosciami)
    # dodatkowo zmieniając na 1.0 -> daily mają tyle co habit, a weekly tyle co weekly goal, co ma sens
    "challenges": 1.0,
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
