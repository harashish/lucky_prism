import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useGoalStore } from "../stores/useGoalStore";
import { useFocusEffect, useRouter } from "expo-router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import FloatingButton from "../../components/FloatingButton";
import GoalItem from "../../features/goals/GoalItem";

dayjs.extend(isoWeek);

const periodNames = ["weekly", "monthly", "yearly"] as const;
type Period = typeof periodNames[number];

export default function GoalsScreen() {
  const router = useRouter();

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const {
    goals,
    loading,
    loadPeriods,
    loadGoals,
    completeGoal,
    toggleStep,
    showArchived,
    setShowArchived,
    toggleArchive
  } = useGoalStore();

  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");

  useEffect(() => {
    loadPeriods();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals(selectedPeriod, showArchived);
    }, [selectedPeriod, showArchived])
  );

  const completedCount = goals.filter(g => g.is_completed).length;
  const progress = goals.length === 0 ? 0 : completedCount / goals.length;
  
  const now = dayjs();
  const timeProgress =
    selectedPeriod === "weekly"
      ? now.diff(now.startOf("isoWeek")) /
        now.endOf("isoWeek").diff(now.startOf("isoWeek"))
      : selectedPeriod === "monthly"
      ? now.diff(now.startOf("month")) /
        now.endOf("month").diff(now.startOf("month"))
      : now.diff(now.startOf("year")) /
        now.endOf("year").diff(now.startOf("year"));

  const onComplete = (goalId: number, title: string) => {
    Alert.alert("Complete goal?", title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          const res = await completeGoal(goalId);

          if (res && gamificationOn && res.xp_gained > 0) {
            useGamificationStore.getState().applyXpResult(res);
          }

          loadGoals(selectedPeriod);
        },
      },
    ]);
  };

  const groupedGoals = React.useMemo(() => {
    const groups: Record<string, typeof goals> = {};

    goals.forEach(goal => {
      const date = dayjs(goal.created_at);

      let label = "";

      if (selectedPeriod === "weekly") {
        const start = date.startOf("isoWeek").format("DD MMM");
        const end = date.endOf("isoWeek").format("DD MMM");
        label = `${start} - ${end}`;
      }

      if (selectedPeriod === "monthly") {
        label = date.format("MMMM YYYY");
      }

      if (selectedPeriod === "yearly") {
        label = date.format("YYYY");
      }

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(goal);
    });

    return Object.entries(groups).map(([label, items]) => ({
      label,
      items,
    }));
  }, [goals, selectedPeriod]);


  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>


<View
  style={{
    alignItems: "center",
    marginBottom: 8,
  }}
>
  <TouchableOpacity
    onPress={() => setShowArchived(!showArchived)}
    style={{
      paddingVertical: 2,
      paddingHorizontal: 10,
    }}
  >
    <AppText
      style={{
        fontSize: 11,
        letterSpacing: 1,
        color: "#777",
        textTransform: "uppercase",
      }}
    >
      {showArchived ? "archived" : "active"}
    </AppText>
  </TouchableOpacity>
</View>

      <View style={{ flexDirection: "row", marginBottom: 12 }}>
        {periodNames.map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPeriod(p)}
            style={{
              flex: 1,
              marginHorizontal: 4,
              padding: 14,
              borderRadius: 12,
              backgroundColor:
                selectedPeriod === p ? colors.buttonActive : colors.card,
              alignItems: "center",
            }}
          >
            <AppText style={{ fontWeight: "bold", textTransform: "capitalize" }}>
              {p}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {!showArchived && (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <AppText style={{ fontSize: 12 }}>
          Goals progress: {Math.round(progress * 100)}%
        </AppText>
        <View
          style={{
            height: 6,
            backgroundColor: colors.background,
            borderRadius: 4,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: 6,
              width: `${progress * 100}%`,
              backgroundColor: colors.buttonActive,
            }}
          />
        </View>
        

        <AppText style={{ fontSize: 12 }}>
          Time ({selectedPeriod}): {Math.round(timeProgress * 100)}%
        </AppText>
        <View
          style={{
            height: 6,
            backgroundColor: colors.background,
            borderRadius: 4,
          }}
        >
          <View
            style={{
              height: 6,
              width: `${timeProgress * 100}%`,
              backgroundColor: colors.buttonActive,
            }}
          />
        </View>
      </View>
      )}

      {loading.list ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.buttonActive} />
        </View>
      ) : goals.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 50 }}>
          <AppText style={{ color: "#777" }}>
            no goals yet for this period
          </AppText>
        </View>
) : (
  <FlatList
    key={selectedPeriod + String(showArchived)}
    data={groupedGoals}
    keyExtractor={(item) => item.label}
    contentContainerStyle={{ paddingBottom: 140 }}
    renderItem={({ item }) => (
      <View style={{ marginBottom: 16 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "#333",
            }}
          />

          <AppText
            style={{
              marginHorizontal: 8,
              fontSize: 12,
              color: "#777",
            }}
          >
            {item.label}
          </AppText>

          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "#333",
            }}
          />
        </View>

        {/* GOALS */}
        {item.items.map(goal => (
          <GoalItem
            key={goal.id}
            item={goal}
            isCompleted={goal.is_completed}
            isExpanded={expandedGoalId === goal.id}
            onToggleExpand={() =>
              setExpandedGoalId(
                expandedGoalId === goal.id ? null : goal.id
              )
            }
            onEdit={() => router.push(`/editGoal/${goal.id}`)}
            onComplete={() => onComplete(goal.id, goal.title)}
            toggleStep={toggleStep}
            toggleArchive={toggleArchive}
          />
        ))}
      </View>
    )}
  />
)}

<FloatingButton onPress={() => router.push("/addGoal")} />

</View>
);
}