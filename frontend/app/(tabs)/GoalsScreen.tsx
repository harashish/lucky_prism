import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Alert } from "react-native";
import AppText from "../../components/AppText";
import { colors, components } from "../../constants/theme";
import { useGoalStore } from "../stores/useGoalStore";
import { useFocusEffect, useRouter } from "expo-router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import FloatingButton from "../../components/FloatingButton";
import { ItemHeader } from "../../components/ItemHeader";
import { ItemDetails } from "../../components/ItemDetails";

dayjs.extend(isoWeek);

const periodNames = ["weekly", "monthly", "yearly"] as const;

export default function GoalsScreen() {
  const router = useRouter();
  const userId = 1;

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const {
    goals,
    history,
    loadPeriods,
    loadUserGoals,
    loadHistory,
    completeGoal,
  } = useGoalStore();




  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);

  // STATE
  const [selectedPeriod, setSelectedPeriod] =
    useState<"weekly" | "monthly" | "yearly">("weekly");

  // EFFECT 1 – init
  useEffect(() => {
    loadPeriods();
    loadHistory();
  }, []);

  // EFFECT 2 – zmiana zakładki
  useEffect(() => {
    loadUserGoals(userId, selectedPeriod);
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadUserGoals(userId, selectedPeriod);
      loadHistory();
    }, [selectedPeriod])
  );

  const completedGoalIds = new Set(history.map(h => h.goal));

  const completedCount = goals.filter(g =>
    completedGoalIds.has(g.id)
  ).length;

  const progress =
    goals.length === 0 ? 0 : completedCount / goals.length;

  const now = dayjs();
  const timeProgress =
    selectedPeriod === "weekly"
      ? now.diff(now.startOf("isoWeek")) / now.endOf("isoWeek").diff(now.startOf("isoWeek"))
      : selectedPeriod === "monthly"
      ? now.diff(now.startOf("month")) / now.endOf("month").diff(now.startOf("month"))
      : now.diff(now.startOf("year")) / now.endOf("year").diff(now.startOf("year"));

  const onComplete = (goalId: number, title: string) => {
    Alert.alert(
      "Complete goal?",
      title,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            const res = await completeGoal(goalId);

            if (res && gamificationOn && res.xp_gained > 0) {
              useGamificationStore.getState().applyXpResult(res);
            }

            loadUserGoals(userId, selectedPeriod);
            loadHistory();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      {/* PERIOD SELECTOR */}
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
              backgroundColor: selectedPeriod === p ? colors.buttonActive : colors.card,
              alignItems: "center",
            }}
          >
            <AppText style={{ fontWeight: "bold", textTransform: "capitalize" }}>
              {p}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* PROGRESS */}
      <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 10, marginBottom: 12 }}>
        <AppText style={{ fontSize: 12 }}>Goals progress: {Math.round(progress * 100)}%</AppText>
        <View style={{ height: 6, backgroundColor: colors.background, borderRadius: 4, marginBottom: 8 }}>
          <View style={{ height: 6, width: `${progress * 100}%`, backgroundColor: colors.buttonActive }} />
        </View>

        <AppText style={{ fontSize: 12 }}>
          Time ({selectedPeriod}): {Math.round(timeProgress * 100)}%
        </AppText>
        <View style={{ height: 6, backgroundColor: colors.background, borderRadius: 4 }}>
          <View style={{ height: 6, width: `${timeProgress * 100}%`, backgroundColor: colors.buttonActive }} />
        </View>
      </View>

      {/* GOALS */}
      <FlatList
        key={selectedPeriod}
        data={goals}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => {
          const isCompleted = completedGoalIds.has(item.id);
          const isExpanded = expandedGoalId === item.id;

          return (
            <TouchableOpacity
              onPress={() => setExpandedGoalId(isExpanded ? null : item.id)}
              onLongPress={() => router.push(`/editGoal/${item.id}`)}
            >
              <View style={{ ...components.container, opacity: isCompleted ? 0.5 : 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <ItemHeader
                    title={item.title}
                    difficulty={item.difficulty?.name}
                  />
                  {!isCompleted && (
                    <TouchableOpacity
                      onPress={() => onComplete(item.id, item.title)}
                      style={components.completeButton  
                      }

                    >
                      <AppText style={{ color: "#fff" }}>+</AppText>
                    </TouchableOpacity>
                  )}




                </View>

                {isExpanded && (
                  <ItemDetails
                    description={item.description}
                    motivation={item.motivation_reason}
                  />

                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <AppText style={{ color: "#777" }}>
              no goals yet for this period
            </AppText>
          </View>
        }
      />

      <FloatingButton onPress={() => router.push("/addGoal")} />
    </View>
  );
}
