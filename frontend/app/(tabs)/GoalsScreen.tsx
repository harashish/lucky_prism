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
  } = useGoalStore();

  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");

  useEffect(() => {
    loadPeriods();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals(selectedPeriod);
    }, [selectedPeriod])
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


  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>

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
          key={selectedPeriod}
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 140 }}
          renderItem={({ item }) => (
            <GoalItem
              item={item}
              isCompleted={item.is_completed}
              isExpanded={expandedGoalId === item.id}
              onToggleExpand={() =>
                setExpandedGoalId(
                  expandedGoalId === item.id ? null : item.id
                )
              }
              onEdit={() => router.push(`/editGoal/${item.id}`)}
              onComplete={() => onComplete(item.id, item.title)}
            />
          )}
        />
      )}

      <FloatingButton onPress={() => router.push("/addGoal")} />
    </View>
  );
}