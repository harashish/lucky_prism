import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Alert } from "react-native";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import { colors, components } from "../../constants/theme";
import { useGoalStore } from "../stores/useGoalStore";
import { useRouter } from "expo-router";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const periodNames = ["week", "month", "year"];

export default function GoalsScreen() {
  const router = useRouter();
  const userId = 1;

  const {
    goals,
    periods,
    history,
    loadPeriods,
    loadUserGoals,
    loadHistory,
    completeGoal,
  } = useGoalStore();

  const [selectedPeriod, setSelectedPeriod] =
    useState<"week" | "month" | "year">("week");

  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);

  useEffect(() => {
    loadPeriods();
    loadUserGoals(userId, selectedPeriod);
    loadHistory();
  }, [selectedPeriod]);

  /** XP */
  const xpGain = (g: any) => {
    const diffPercent = (g.difficulty?.xp_value || 0) / 100;
    const periodBase = g.period?.default_xp || 0;
    return Math.round(periodBase * diffPercent);
  };

  /** Ukończone */
  const completedGoalIds = new Set(history.map((h) => h.goal));

  const goalsForPeriod = goals.filter(
    (g) => g.period?.name?.toLowerCase() === selectedPeriod
  );

  /** Goals progress */
  const completedCount = goalsForPeriod.filter((g) =>
    completedGoalIds.has(g.id)
  ).length;

  const progress =
    goalsForPeriod.length === 0
      ? 0
      : completedCount / goalsForPeriod.length;

  /** Time progress */
  const now = dayjs();

  const weekStart = now.startOf("isoWeek");
  const weekEnd = now.endOf("isoWeek");

  const monthStart = now.startOf("month");
  const monthEnd = now.endOf("month");

  const yearStart = now.startOf("year");
  const yearEnd = now.endOf("year");

  let timeProgress = 0;

  if (selectedPeriod === "week") {
    timeProgress = now.diff(weekStart) / weekEnd.diff(weekStart);
  }

  if (selectedPeriod === "month") {
    timeProgress = now.diff(monthStart) / monthEnd.diff(monthStart);
  }

  if (selectedPeriod === "year") {
    timeProgress = now.diff(yearStart) / yearEnd.diff(yearStart);
  }

  /** Complete */
  const onComplete = async (goalId: number, title: string) => {
    Alert.alert(
      "Are you sure?",
      `Are you sure you completed "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            const res = await completeGoal(goalId);
            if (res) {
              Alert.alert("Done", `+${res.total_xp}XP`);
              loadUserGoals(userId, selectedPeriod);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      {/* PERIOD SELECTOR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        {periodNames.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPeriod(p as any)}
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

      {/* PROGRESS SUMMARY */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 12,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <AppText style={{ fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
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
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: colors.buttonActive,
              borderRadius: 4,
            }}
          />
        </View>

        <AppText style={{ fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
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
              width: `${Math.round(timeProgress * 100)}%`,
              backgroundColor: colors.buttonActive,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* GOALS LIST */}
      <FlatList
        data={goalsForPeriod}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => {
          const isCompleted = completedGoalIds.has(item.id);
          const isExpanded = expandedGoalId === item.id;

          return (
            <TouchableOpacity
              onPress={() =>
                setExpandedGoalId(isExpanded ? null : item.id)
              }
              onLongPress={() => router.push(`/editGoal/${item.id}`)}
              delayLongPress={300}
            >
              <View
                style={{
                  ...components.container,
                  opacity: isCompleted ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <AppText
                    style={{
                      fontWeight: "bold",
                      textDecorationLine: isCompleted
                        ? "line-through"
                        : "none",
                      color: isCompleted ? "#777" : colors.text,
                    }}
                  >
                    {item.title}
                  </AppText>

                  {!isCompleted && (
                    <TouchableOpacity
                      onPress={() => onComplete(item.id, item.title)}
                      style={components.completeButton}
                    >
                      <AppText style={{ color: "#fff" }}>✔️</AppText>
                    </TouchableOpacity>
                  )}
                </View>

                {isExpanded && (
                  <View style={{ marginTop: 8 }}>
                    {item.description ? (
                      <AppText
                        style={{
                          marginBottom: 4,
                          color: isCompleted ? "#777" : colors.text,
                        }}
                      >
                        {item.description}
                      </AppText>
                    ) : null}

                    {item.motivation_reason ? (
                      <AppText
                        style={{
                          fontSize: 12,
                          opacity: 0.8,
                          marginBottom: 4,
                        }}
                      >
                        Motivation: {item.motivation_reason}
                      </AppText>
                    ) : null}

                    <AppText style={{ fontSize: 12, opacity: 0.7 }}>
                      {xpGain(item)} XP
                    </AppText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <AppText>Brak celów na ten okres</AppText>
          </View>
        )}
      />

      {/* FLOATING ADD */}
      <TouchableOpacity
        onPress={() => router.push("/addGoal")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.buttonActive,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
      >
        <AppText style={{ fontSize: 32, color: "#fff" }}>＋</AppText>
      </TouchableOpacity>
    </View>
  );
}
