from apps.gamification.config.xp_config import BASE_LEVEL_XP

def calculate_level(total_xp: int) -> int:
    level = 1
    xp = total_xp

    while xp >= BASE_LEVEL_XP * level:
        xp -= BASE_LEVEL_XP * level
        level += 1

    return level
