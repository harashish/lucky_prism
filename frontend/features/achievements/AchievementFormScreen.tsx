import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import { useAchievementStore } from "../../app/stores/useAchievementStore";
import { useHabitStore } from "../../app/stores/useHabitStore";
import FormErrorModal from "../../components/FormErrorModal";
import { useRouter } from "expo-router";
import type { ViewStyle } from "react-native";
import { useMoodStore } from "../../app/stores/useMoodStore";
import { useSobrietyStore } from "../../app/stores/useSobrietyStore";

type Props = {
  editingId?: number;
};


const CONDITION_META: Record<string, {
  description?: string
  targetLabel?: string
}> = {
  xp_reached: { targetLabel: "Required XP" },
  level_reached: { targetLabel: "Required level" },

  habit_days: { targetLabel: "Required days" },
  any_habit_days: { targetLabel: "Required days" },
  habit_streak: { targetLabel: "Required streak" },
  any_habit_streak: { targetLabel: "Required streak" },

  mood_logged_days: { targetLabel: "Required days" },
  specific_mood_count: { targetLabel: "Required occurrences" },

  goal_completed: { targetLabel: "Goals required" },
  goal_completed_by_period: { targetLabel: "Goals required" },

  notes_count: { targetLabel: "Notes required" },

  sobriety_duration: { targetLabel: "Required duration" },
  any_sobriety_duration: { targetLabel: "Required duration" },

  manual: {},
};


const CONDITION_GROUPS = [
  {
    label: "Progress",
    items: [
      { value: "xp_reached", label: "XP reached" },
      { value: "level_reached", label: "Level reached" },
    ],
  },
  {
    label: "Habits",
    items: [
      { value: "habit_days", label: "Habit days (specific)" },
      { value: "any_habit_days", label: "Habit days (any)" },
      { value: "habit_streak", label: "Habit streak (specific)" },
      { value: "any_habit_streak", label: "Habit streak (any)" },
    ],
  },
  {
    label: "Mood",
    items: [
      { value: "mood_logged_days", label: "Mood logged days" },
      { value: "specific_mood_count", label: "Specific mood count" },
    ],
  },
  {
    label: "Goals",
    items: [
      { value: "goal_completed", label: "Completed goals" },
      { value: "goal_completed_by_period", label: "Completed goals by period" },
    ],
  },
  {
    label: "Notes",
    items: [
      { value: "notes_count", label: "Notes created" },
    ],
  },
  {
    label: "Sobriety",
    items: [
      { value: "sobriety_duration", label: "Sobriety duration (specific)" },
      { value: "any_sobriety_duration", label: "Sobriety duration (any)" },
    ],
  },
  {
    label: "Other",
    items: [{ value: "manual", label: "Manual unlock" }],
  },
];

  const getConditionLabel = (value: string) => {
    for (const group of CONDITION_GROUPS) {
      const found = group.items.find(i => i.value === value);
      if (found) return found.label;
    }
    return value;
  };

export default function AchievementFormScreen({ editingId }: Props) {
  const router = useRouter();

  const {
    createAchievement,
    updateAchievement,
    loadAllAchievements,
  } = useAchievementStore();

  const { difficulties, loadDifficulties, habits, loadHabits } =
    useHabitStore();

    const { moodTypes, loadMoodTypes } = useMoodStore();

    const { sobrietyList, loadSobriety } = useSobrietyStore();

  /*
  ========================
  STATE
  ========================
  */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [conditionType, setConditionType] = useState("manual");
  const [target, setTarget] = useState("1");

  const [habitId, setHabitId] = useState<number | null>(null);
  const [moodType, setMoodType] = useState<string | null>(null);

  const [goalPeriod, setGoalPeriod] = useState<string | null>(null);

  const [sobrietyId, setSobrietyId] = useState<number | null>(null);
  const [sobrietyUnit, setSobrietyUnit] = useState("days");
  

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false);

  /*
  ========================
  HELPERS
  ========================
  */

  const requiresTarget = conditionType !== "manual";

  const isMoodCondition = conditionType === "specific_mood_count";

const isSpecificHabitCondition =
  conditionType === "habit_days" ||
  conditionType === "habit_streak";

const isAnyHabitCondition =
  conditionType === "any_habit_days" ||
  conditionType === "any_habit_streak";

  const isGoalByPeriodCondition =
  conditionType === "goal_completed_by_period";

  const isSpecificSobrietyCondition =
  conditionType === "sobriety_duration";

const isAnySobrietyCondition =
  conditionType === "any_sobriety_duration";
  /*
  ========================
  LOAD DATA
  ========================
  */

  useEffect(() => {
  loadMoodTypes();
}, []);

useEffect(() => {
  loadSobriety();
}, []);

  useEffect(() => {
    loadDifficulties();
    loadHabits();

    if (!editingId) return;

    const load = async () => {
      setLoading(true);

      await loadAllAchievements();

      const a = useAchievementStore
        .getState()
        .allAchievements.find(a => a.id === editingId);

      if (!a) {
        setErrorMessage("Failed to load achievement");
      } else {
        setName(a.name);
        setDescription(a.description || "");
        setDifficultyId(a.difficulty?.id ?? null);
        setConditionType(a.condition_type);
        setTarget(String(a.condition_config?.target ?? 1));
        setHabitId(a.condition_config?.habit_id ?? null);
        setMoodType(a.condition_config?.mood ?? null);
        setGoalPeriod(a.condition_config?.period ?? null);
        setSobrietyId(a.condition_config?.sobriety_id ?? null);
        setSobrietyUnit(a.condition_config?.unit ?? "days");
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  /*
  ========================
  RESET CONDITION FIELDS
  ========================
  */


  useEffect(() => {
    if (!isSpecificHabitCondition) {
      setHabitId(null);
    }
  }, [conditionType]);

  useEffect(() => {
    if (!isMoodCondition) {
      setMoodType(null);
    }
  }, [conditionType]);

  useEffect(() => {
  if (!isGoalByPeriodCondition) {
    setGoalPeriod(null);
  }
}, [conditionType]);

useEffect(() => {
  if (!isSpecificSobrietyCondition) {
    setSobrietyId(null);
  }
}, [conditionType]);

useEffect(() => {
  if (!isSpecificSobrietyCondition && !isAnySobrietyCondition) {
    setSobrietyUnit("days");
  }
}, [conditionType]);

  /*
  ========================
  SAVE
  ========================
  */

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Enter name");
      return;
    }

    if (!difficultyId) {
      setErrorMessage("Select difficulty");
      return;
    }

    const targetNumber = Number(target);

    if (requiresTarget && (!targetNumber || targetNumber <= 0)) {
      setErrorMessage("Target must be > 0");
      return;
    }

    if (isSpecificHabitCondition && !habitId) {
      setErrorMessage("Select habit");
      return;
    }

    if (isMoodCondition && !moodType) {
      setErrorMessage("Select mood type");
      return;
    }

    if (isGoalByPeriodCondition && !goalPeriod) {
      setErrorMessage("Select goal period");
      return;
    }

    if (isSpecificSobrietyCondition && !sobrietyId) {
      setErrorMessage("Select sobriety");
      return;
    }

    setLoading(true);

    const config: Record<string, any> = {};

    if (requiresTarget) {
      config.target = targetNumber;
    }

    if (isSpecificHabitCondition) {
      config.habit_id = habitId;
    }

    if (isMoodCondition) {
      config.mood = moodType;
    }

    if (isGoalByPeriodCondition) {
        config.period = goalPeriod;
      }

    if (isSpecificSobrietyCondition) {
      config.sobriety_id = sobrietyId;
    }

    if (isSpecificSobrietyCondition || isAnySobrietyCondition) {
      config.unit = sobrietyUnit;
    }  

    const payload = {
      name,
      description,
      difficulty_id: difficultyId,
      condition_type: conditionType,
      condition_config: config,
    };

    try {
      if (editingId) {
        await updateAchievement(editingId, payload);
      } else {
        await createAchievement(payload);
      }

      router.back();
    } catch {
      setErrorMessage("Failed to save achievement");
    } finally {
      setLoading(false);
    }
  };

  /*
  ========================
  UI
  ========================
  */

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          padding: spacing.m,
          backgroundColor: colors.background,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* NAME */}
        <AppText style={{ marginBottom: 6 }}>Name</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[inputStyle, { color: colors.text }]}
          placeholderTextColor="#7a7891"
        />

        {/* DESCRIPTION */}
        <AppText style={{ marginBottom: 6 }}>Description</AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ ...inputStyle, minHeight: 80, color: colors.text }}
          placeholderTextColor="#7a7891"
        />

        {/* DIFFICULTY */}
        <AppText style={{ marginBottom: 6 }}>Difficulty</AppText>
        <View style={buttonRow}>
          {difficulties.map(d => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setDifficultyId(d.id)}
              style={{
                ...choiceButton,
                backgroundColor:
                  difficultyId === d.id
                    ? colors.buttonActive
                    : colors.card,
              }}
            >
              <AppText>{d.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* CONDITION TYPE */}
        <AppText style={{ marginBottom: 6 }}>Condition</AppText>

        <TouchableOpacity
          onPress={() => setConditionDropdownOpen(!conditionDropdownOpen)}
          style={inputStyle}
        >
          <AppText style={{ color: colors.text }}>
            {getConditionLabel(conditionType) || "Select condition"}
          </AppText>
        </TouchableOpacity>

        {conditionDropdownOpen && (
          <View style={{ marginBottom: spacing.m }}>
            {CONDITION_GROUPS.map(group => (
              <View key={group.label}>
                <AppText style={{ color: "#888", marginTop: 8 }}>
                  {group.label}
                </AppText>

                {group.items.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => {
                      setConditionType(item.value);
                      setConditionDropdownOpen(false);
                    }}
                    style={choiceButton}
                  >
                    <AppText style={{ color: colors.text }}>
                      {item.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* TARGET */}
        {conditionType !== "manual" && (
          <>
            <AppText style={{ marginBottom: 6 }}>
              {CONDITION_META[conditionType]?.targetLabel || "Target"}
            </AppText>

            <TextInput
              value={target}
              onChangeText={setTarget}
              keyboardType="numeric"
              style={[inputStyle, { color: colors.text }]}
            />
          </>
        )}

        {/* HABIT PICKER */}
        {isSpecificHabitCondition && (
          <>
            <AppText style={{ marginBottom: 6 }}>Habit</AppText>
            <View style={buttonRow}>
              {habits.map(h => (
                <TouchableOpacity
                  key={h.id}
                  onPress={() => setHabitId(h.id)}
                  style={{
                    ...choiceButton,
                    backgroundColor:
                      habitId === h.id
                        ? colors.buttonActive
                        : colors.card,
                  }}
                >
                  <AppText>{h.title}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isMoodCondition && (
          <>
            <AppText style={{ marginBottom: 6 }}>Mood type</AppText>

            <View style={buttonRow}>
              {moodTypes.map(m => (
                <TouchableOpacity
                  key={m.value}
                  onPress={() => setMoodType(m.value)}
                  style={{
                    ...choiceButton,
                    backgroundColor:
                      moodType === m.value
                        ? colors.buttonActive
                        : colors.card,
                  }}
                >
                  <AppText>{m.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isGoalByPeriodCondition && (
          <>
            <AppText style={{ marginBottom: 6 }}>Goal period</AppText>

            <View style={buttonRow}>
              {["weekly", "monthly", "yearly"].map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setGoalPeriod(p)}
                  style={{
                    ...choiceButton,
                    backgroundColor:
                      goalPeriod === p
                        ? colors.buttonActive
                        : colors.card,
                  }}
                >
                  <AppText>{p}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {isSpecificSobrietyCondition && (
  <>
    <AppText style={{ marginBottom: 6 }}>Sobriety</AppText>

    <View style={buttonRow}>
      {sobrietyList.map(s => (
        <TouchableOpacity
          key={s.id}
          onPress={() => setSobrietyId(s.id)}
          style={{
            ...choiceButton,
            backgroundColor:
              sobrietyId === s.id
                ? colors.buttonActive
                : colors.card,
          }}
        >
          <AppText>{s.name}</AppText>
        </TouchableOpacity>
      ))}
    </View>
  </>
)}


{(isSpecificSobrietyCondition || isAnySobrietyCondition) && (
  <>
    <AppText style={{ marginBottom: 6 }}>Time unit</AppText>

    <View style={buttonRow}>
      {["days", "months", "years"].map(u => (
        <TouchableOpacity
          key={u}
          onPress={() => setSobrietyUnit(u)}
          style={{
            ...choiceButton,
            backgroundColor:
              sobrietyUnit === u
                ? colors.buttonActive
                : colors.card,
          }}
        >
          <AppText>{u}</AppText>
        </TouchableOpacity>
      ))}
    </View>
  </>
)}

    {/* SAVE */}
        <TouchableOpacity
          onPress={save}
          disabled={loading}
          style={saveButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {editingId ? "Save" : "Create"}
            </AppText>
          )}
        </TouchableOpacity>
      </ScrollView>

      <FormErrorModal
        visible={!!errorMessage}
        message={errorMessage || ""}
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}

/*
========================
STYLES
========================
*/

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.inputBorder,
  padding: spacing.s,
  borderRadius: radius.md,
  marginBottom: spacing.m,
};

const buttonRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: spacing.m,
};

const choiceButton: ViewStyle = {
  padding: spacing.s,
  borderRadius: radius.md,
  marginRight: spacing.s,
  marginBottom: spacing.s,
};

const saveButton: ViewStyle = {
  backgroundColor: colors.buttonActive,
  padding: spacing.m,
  borderRadius: radius.md,
  alignItems: "center",
};