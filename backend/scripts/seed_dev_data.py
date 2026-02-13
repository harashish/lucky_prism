print("\n=== SEED DEV DATA START ===\n")
from apps.gamification.models import User
from apps.challenges.models import ChallengeType, ChallengeDefinition, ChallengeTag
from apps.common.models import DifficultyType
from apps.goals.models import GoalPeriod, Goal
from apps.todos.models import TodoCategory, TodoTask
from apps.habits.models import Habit

# USER
user = User.objects.first()
if not user:
    user = User.objects.create()
    print(f"[USER] Created default user (id={user.id})")
else:
    print(f"[USER] Exists (id={user.id})")

# DIFFICULTY TYPES
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


# CHALLENGE TYPES
daily_type, _ = ChallengeType.objects.get_or_create(name="daily")
weekly_type, _ = ChallengeType.objects.get_or_create(name="weekly")


print("[CHALLENGE TYPE] Daily / Weekly ready")


# CHALLENGE TAG
tag, created = ChallengeTag.objects.get_or_create(name="General")
print(f"[TAG] 'General' {'created' if created else 'exists'}")

# GOAL PERIODS
periods = ["weekly", "monthly", "yearly"]

period_map = {}

for name in periods:
    period, created = GoalPeriod.objects.get_or_create(name=name)
    period_map[name] = period
    print(f"[GOAL PERIOD] {name} {'created' if created else 'exists'}")


# DEFAULT TODO CATEGORY

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


# MODULE DEFINITIONS

from apps.settings.models import ModuleDefinition

default_modules = [
    "habits",
    "challenges",
    "todos",
    "goals",
    "random",
    "gamification",
    "notes",
    "mood",
    "sobriety",
]

for module in default_modules:
    obj, created = ModuleDefinition.objects.get_or_create(
        user=user,
        module=module,
        defaults={"is_enabled": True},
    )
    print(f"[MODULE DEF] {module} {'created' if created else 'exists'}")


# DASHBOARD TILES

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


# DEFAULT GOALS

GOALS_DATA = {
    "weekly": [
        {
            "title": "Finish current essay section",
            "difficulty": "Medium",
            "motivation_reason": (
                "This goal helps maintain steady academic progress "
                "without last-minute stress or burnout."
            ),
        },
        {
            "title": "Maintain daily meditation streak",
            "difficulty": "Easy",
            "motivation_reason": (
                "Consistency in small daily practices builds mental clarity "
                "and emotional stability."
            ),
        },
        {
            "title": "Reduce screen time after 10 PM",
            "difficulty": "Hard",
            "motivation_reason": (
                "Limiting late-night stimulation improves sleep quality "
                "and overall cognitive performance."
            ),
        },
    ],
    "monthly": [
        {
            "title": "Complete one major university assignment",
            "difficulty": "Hard",
            "motivation_reason": (
                "Large academic milestones require sustained effort "
                "and long-term planning."
            ),
        },
        {
            "title": "Read one non-fiction book mindfully",
            "difficulty": "Medium",
            "motivation_reason": (
                "Deep reading supports long-term learning and reflection."
            ),
        },
        {
            "title": "Build a stable morning routine",
            "difficulty": "Easy",
            "motivation_reason": (
                "A predictable morning routine reduces decision fatigue "
                "and supports daily focus."
            ),
        },
    ],
    "yearly": [
        {
            "title": "Maintain consistent physical activity",
            "difficulty": "Medium",
            "motivation_reason": (
                "Long-term health requires sustainable habits rather than extremes."
            ),
        },
        {
            "title": "Develop emotional self-regulation skills",
            "difficulty": "Hard",
            "motivation_reason": (
                "Emotional awareness and regulation are long-term skills "
                "that require continuous self-observation."
            ),
        },
        {
            "title": "Create a personal knowledge system",
            "difficulty": "Hard",
            "motivation_reason": (
                "Building a structured system for notes and reflection "
                "supports lifelong learning."
            ),
        },
    ],
}

for period_name, goals in GOALS_DATA.items():
    period = period_map[period_name]
    existing = Goal.objects.filter(user=user, period=period).count()

    if existing > 0:
        print(f"[GOALS] {period_name}: already exists, skipping")
        continue

    for g in goals:
        Goal.objects.create(
            user=user,
            title=g["title"],
            period=period,
            difficulty=difficulty_map[g["difficulty"]],
            motivation_reason=g["motivation_reason"],
            description="",
        )
        print(f"[GOALS] Created {period_name}: {g['title']}")

# DEFAULT TODOS

TODOS_DATA = [
    {
        "content": "Reply to important emails",
        "difficulty": "Easy",
    },
    {
        "content": "Review lecture notes",
        "difficulty": "Easy",
    },
    {
        "content": "Refactor one frontend component",
        "difficulty": "Medium",
    },
    {
        "content": "Prepare outline for thesis chapter",
        "difficulty": "Hard",
    },
    {
        "content": "Organize project files",
        "difficulty": "Medium",
    },
]

existing = TodoTask.objects.filter(user=user).count()
if existing == 0:
    for t in TODOS_DATA:
        TodoTask.objects.create(
            user=user,
            content=t["content"],
            category=todo_category,
            custom_difficulty=difficulty_map[t["difficulty"]],
        )
        print(f"[TODO] Created: {t['content']}")
else:
    print("[TODO] Already exist, skipping")

# DEFAULT CHALLENGES

if not ChallengeDefinition.objects.exists():

    daily_challenges = [
        (
            "Tidy One Area",
            "Organize one area of your room. Wipe the sink. If laundry or trash is piling up - take care of it.",
            "Easy",
        ),
        (
            "Vacuum the Room",
            "Vacuum your room slowly and mindfully.",
            "Easy",
        ),
        (
            "Eat a Vegetable",
            "Eat at least one vegetable today. Simple and intentional.",
            "Easy",
        ),
        (
            "Read 20 Pages",
            "Read 20 pages of a book with full focus.",
            "Medium",
        ),
        (
            "Mindful Outdoor Walk",
            "Go outside for 20 minutes. No headphones. Use your senses and stay present.",
            "Medium",
        ),
        (
            "Read an Article",
            "Read one long article or two short ones with attention.",
            "Medium",
        ),
        (
            "Core Workout",
            "Exercise: Hollow body hold 3x + plank 2 minutes.",
            "Hard",
        ),
        (
            "Write or Be Bored",
            "Write inspiration, a stream of consciousness, journal - or just allow yourself to be bored.",
            "Hard",
        ),
        (
            "Silence Session",
            "Sit in silence in the bathroom. Set a timer for 1 hour. Meditate, write, or just sit.",
            "Hard",
        ),
        (
            "Listen to a New Album",
            "Listen to a new album you don't know. No distractions. Walk or sit in the bathroom.",
            "Medium",
        ),
        (
            "No Familiar Music",
            "Listen only to new or unfamiliar music today. No old favorites.",
            "Medium",
        ),
        (
            "Observe Extremes",
            "Observe emotional or mental extremes today without judging or reacting.",
            "Hard",
        ),
        (
            "Broccoli Topping",
            "Add broccoli (or another green vegetable) to a meal today.",
            "Easy",
        ),
    ]


    weekly_challenges = [
        (
            "Digital Detox Block",
            "Avoid computers and electronics for the next 2-3 hours at least once this week.",
            "Medium",
        ),
        (
            "Watch a Film Mindfully",
            "Watch one film from your list without touching your phone for the entire duration.",
            "Medium",
        ),
        (
            "Choose One Thing to Avoid",
            "Choose one habit or behavior you will consciously not do for 3 days.",
            "Hard",
        ),
        (
            "No Apologizing for Yourself",
            "Spend a full week without apologizing for your existence, needs, or boundaries.",
            "Hard",
        ),
        (
            "Focused Essay Chapter",
            "Write one full chapter or section of an essay with deep focus.",
            "Hard",
        ),
    ]


    for title, description, diff_name in daily_challenges:
        c = ChallengeDefinition.objects.create(
            title=title,
            description=description,
            type=daily_type,
            difficulty=difficulty_map[diff_name],
        )
        c.tags.add(tag)
        print(f"[CHALLENGE] Daily ({diff_name}): {title}")


    for title, description, diff_name in weekly_challenges:
        c = ChallengeDefinition.objects.create(
            title=title,
            description=description,
            type=weekly_type,
            difficulty=difficulty_map[diff_name],
        )
        c.tags.add(tag)
        print(f"[CHALLENGE] Weekly ({diff_name}): {title}")


else:
    print("[CHALLENGE] Already exist, skipping")


# HABITS

HABITS_DATA = [
    {
        "title": "Meditation",
        "difficulty": "Easy",
        "motivation_reason": (
            "Regular meditation supports emotional balance "
            "and improves focus."
        ),
    },
    {
        "title": "Stretching",
        "difficulty": "Easy",
        "motivation_reason": (
            "Daily stretching reduces physical tension "
            "caused by prolonged sitting."
        ),
    },
    {
        "title": "Reading",
        "difficulty": "Medium",
        "motivation_reason": (
            "Consistent reading strengthens attention span "
            "and long-term memory."
        ),
    },
    {
        "title": "Cold exposure",
        "difficulty": "Hard",
        "motivation_reason": (
            "Cold exposure challenges comfort zones "
            "and builds stress resilience."
        ),
    },
]

for h in HABITS_DATA:
    obj, created = Habit.objects.get_or_create(
        user=user,
        title=h["title"],
        defaults={
            "difficulty": difficulty_map[h["difficulty"]],
            "motivation_reason": h["motivation_reason"],
        },
    )
    print(f"[HABIT] {h['title']} {'created' if created else 'exists'}")



print("\n=== SEED DEV DATA DONE ===\n")
