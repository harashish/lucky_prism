# scripts/seed_dev_data.py

print("\n=== SEED DEV DATA START ===\n")

# =====================
# IMPORTY MODELI
# =====================

from apps.gamification.models import User
from apps.challenges.models import ChallengeType, ChallengeDefinition, ChallengeTag
from apps.common.models import DifficultyType
from apps.goals.models import GoalPeriod, Goal
from apps.todos.models import TodoCategory, TodoTask
from apps.habits.models import Habit

# =====================
# USER
# =====================

user = User.objects.first()
if not user:
    user = User.objects.create()
    print(f"[USER] Created default user (id={user.id})")
else:
    print(f"[USER] Exists (id={user.id})")

# =====================
# DIFFICULTY TYPES
# =====================

difficulties = [
    ("Trivial", 1),
    ("Easy", 2),
    ("Medium", 3),
    ("Hard", 4),
]

difficulty_map = {}

for name, order in difficulties:
    obj, created = DifficultyType.objects.get_or_create(
        name=name,
        defaults={"order": order},
    )

    difficulty_map[name] = obj
    print(f"[DIFFICULTY] {name} ({order}) {'created' if created else 'exists'}")


# =====================
# CHALLENGE TYPES
# =====================

daily_type, _ = ChallengeType.objects.get_or_create(name="daily")
weekly_type, _ = ChallengeType.objects.get_or_create(name="weekly")


print("[CHALLENGE TYPE] Daily / Weekly ready")

# =====================
# CHALLENGE TAG
# =====================

tag, created = ChallengeTag.objects.get_or_create(name="General")
print(f"[TAG] 'General' {'created' if created else 'exists'}")

# =====================
# GOAL PERIODS
# =====================

periods = ["weekly", "monthly", "yearly"]

period_map = {}

for name in periods:
    period, created = GoalPeriod.objects.get_or_create(name=name)
    period_map[name] = period
    print(f"[GOAL PERIOD] {name} {'created' if created else 'exists'}")


# =====================
# DEFAULT TODO CATEGORY
# =====================

from apps.todos.models import TodoCategory

todo_category, created = TodoCategory.objects.get_or_create(
    name="General",
    defaults={
        "difficulty": difficulty_map["Trivial"],
    }
)

if created:
    print("[TODO CATEGORY] 'General' created")
else:
    print("[TODO CATEGORY] 'General' already exists")



# =====================
# MODULE DEFINITIONS (USER TOGGLES)
# =====================

from apps.settings.models import ModuleDefinition

default_modules = [
    "habits",
    "challenges",
    "todos",
    "goals",
    "random",
    "gamification",
    "notes",
]

for module in default_modules:
    obj, created = ModuleDefinition.objects.get_or_create(
        user=user,
        module=module,
        defaults={"is_enabled": True},
    )
    print(f"[MODULE DEF] {module} {'created' if created else 'exists'}")


# =====================
# DASHBOARD TILES
# =====================

from apps.settings.models import DashboardTile

dashboard_defaults = [
    ("level_gamification", "Level gamification", "gamification"),
    ("biggest_streak", "Biggest streak", "habits"),
    ("random_habit", "Random habit", "habits"),
    ("random_todo", "Random todo", "todos"),
    ("goal_week", "Week goal", "goals"),
    ("goal_month", "Month goal", "goals"),
    ("goal_year", "Year goal", "goals"),
    ("daily_challenge", "Daily challenge", "challenges"),
    ("weekly_challenge", "Weekly challenge", "challenges"),
    ("random_note", "Random note", "notes"),
]


for key, name, module_dep in dashboard_defaults:
    obj, created = DashboardTile.objects.get_or_create(
        user=user,
        key=key,
        defaults={
            "name": name, 
            "is_enabled": True, 
            "module_dependency": module_dep
        },
    )
    if created:
        print(f"[DASHBOARD TILE] {key} created")
    else:
        print(f"[DASHBOARD TILE] {key} exists")

'''

# =====================
# DEFAULT GOALS
# =====================

for period_name, period in period_map.items():
    existing = Goal.objects.filter(user=user, period=period).count()

    if existing >= 3:
        print(f"[GOALS] {period_name}: already has {existing}")
        continue

    for i in range(existing + 1, 4):
        Goal.objects.create(
            user=user,
            title=f"Default {period_name} goal {i}",
            period=period,
            difficulty=difficulty_map["Easy"],
            motivation_reason=(
                "This goal exists to build long-term consistency, "
                "reduce decision fatigue, and align daily actions "
                "with deeper personal values."
            ),
        )
        print(f"[GOALS] Created {period_name} goal {i}")

# =====================
# DEFAULT TODOS
# =====================

todo_count = TodoTask.objects.filter(user=user).count()

if todo_count < 5:
    for i in range(todo_count + 1, 6):
        TodoTask.objects.create(
            user=user,
            content=f"Default todo {i}",
            category=todo_category,
            custom_difficulty=difficulty_map["Easy"],
        )
        print(f"[TODO] Created todo {i}")
else:
    print(f"[TODO] Already has {todo_count}")

# =====================
# DEFAULT CHALLENGES (CURATED)
# =====================

if not ChallengeDefinition.objects.exists():

    daily_challenges = [
        (
            "Tidy One Area",
            "Organize one area of your room. Wipe the sink. If laundry or trash is piling up - take care of it.",
        ),
        (
            "Vacuum the Room",
            "Vacuum your room slowly and mindfully.",
        ),
        (
            "Core Workout",
            "Exercise: Hollow body hold 3x + plank 2 minutes.",
        ),
        (
            "Read 20 Pages",
            "Read 20 pages of a book with full focus.",
        ),
        (
            "Mindful Outdoor Walk",
            "Go outside for 20 minutes. No headphones. Use your senses and stay present.",
        ),
        (
            "Eat a Vegetable",
            "Eat at least one vegetable today. Simple and intentional.",
        ),
        (
            "Write or Be Bored",
            "Write inspiration, a stream of consciousness, journal - or just allow yourself to be bored.",
        ),
        (
            "Read an Article",
            "Read one long article or two short ones with attention.",
        ),
        (
            "Silence Session",
            "Sit in silence in the bathroom. Set a timer for 1 hour. Meditate, write, or just sit.",
        ),
        (
            "Listen to a New Album",
            "Listen to a new album you don't know. No distractions. Walk or sit in the bathroom.",
        ),
        (
            "No Familiar Music",
            "Listen only to new or unfamiliar music today. No old favorites.",
        ),
        (
            "Observe Extremes",
            "Observe emotional or mental extremes today without judging or reacting.",
        ),
        (
            "Broccoli Topping",
            "Add broccoli (or another green vegetable) to a meal today.",
        ),
    ]

    weekly_challenges = [
        (
            "No Apologizing for Yourself",
            "Spend a full week without apologizing for your existence, needs, or boundaries.",
        ),
        (
            "Digital Detox Block",
            "Avoid computers and electronics for the next 2–3 hours at least once this week.",
        ),
        (
            "Choose One Thing to Avoid",
            "Choose one habit or behavior you will consciously not do for 3 days.",
        ),
        (
            "Focused Essay Chapter",
            "Write one full chapter or section of an essay with deep focus.",
        ),
        (
            "Watch a Film Mindfully",
            "Watch one film from your list without touching your phone for the entire duration.",
        ),
    ]

    for title, description in daily_challenges:
        c = ChallengeDefinition.objects.create(
            title=title,
            description=description,
            type=daily_type,
            difficulty=difficulty_map["Easy"],
        )
        c.tags.add(tag)
        print(f"[CHALLENGE] Daily: {title}")

    for title, description in weekly_challenges:
        c = ChallengeDefinition.objects.create(
            title=title,
            description=description,
            type=weekly_type,
            difficulty=difficulty_map["Easy"],
        )
        c.tags.add(tag)
        print(f"[CHALLENGE] Weekly: {title}")

else:
    print("[CHALLENGE] Already exist, skipping")


# =====================
# HABITS
# =====================

habit_names = ["Meditation", "Stretching", "Reading"]

for name in habit_names:
    obj, created = Habit.objects.get_or_create(
        user=user,
        title=name,
        defaults={
        "difficulty": difficulty_map["Easy"],
        "motivation_reason": (
            "This habit supports clarity, self-regulation, "
            "and long-term psychological stability."
        ),
    },
        
    )
    print(f"[HABIT] {name} {'created' if created else 'exists'}")


print("\n=== SEED DEV DATA DONE ===\n")
'''