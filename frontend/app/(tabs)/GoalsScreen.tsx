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

  useEffect(() => {
    loadPeriods();
    loadUserGoals(userId, selectedPeriod);
    loadHistory();
  }, [selectedPeriod]);

  /** NOWA LOGIKA XP =============================== */
  const xpGain = (g: any) => {
    const diffPercent = (g.difficulty?.xp_value || 0) / 100;
    const periodBase = g.period?.default_xp || 0;
    return Math.round(periodBase * diffPercent);
  };

  /** Ukończone goals ============================== */
  const completedGoalIds = new Set(history.map((h) => h.goal));

  const goalsForPeriod = goals.filter(
    (g) => g.period?.name?.toLowerCase() === selectedPeriod
  );

  /** PROGRESS #1 (procent ukończonych goalów w tym okresie) */
  const completedCount = goalsForPeriod.filter((g) =>
    completedGoalIds.has(g.id)
  ).length;

  const progress =
    goalsForPeriod.length === 0
      ? 0
      : completedCount / goalsForPeriod.length;

  /** TIME PROGRESS ================================ */

    const now = dayjs();

    // week
    const weekStart = now.startOf("isoWeek");
    const weekEnd = now.endOf("isoWeek");

    // month
    const monthStart = now.startOf("month");
    const monthEnd = now.endOf("month");

    // year
    const yearStart = now.startOf("year");
    const yearEnd = now.endOf("year");

    let timeProgress = 0;

    if (selectedPeriod === "week") {
    const total = weekEnd.diff(weekStart);
    const passed = now.diff(weekStart);
    timeProgress = passed / total;
    }

    if (selectedPeriod === "month") {
    const total = monthEnd.diff(monthStart);
    const passed = now.diff(monthStart);
    timeProgress = passed / total;
    }

    if (selectedPeriod === "year") {
    const total = yearEnd.diff(yearStart);
    const passed = now.diff(yearStart);
    timeProgress = passed / total;
    }


  /** Ukończenie goal */
  const onComplete = async (goalId: number, title: string) => {
    Alert.alert(
      "Ukończyć cel?",
      `Czy na pewno ukończyć "${title}"?`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Tak",
          onPress: async () => {
            const res = await completeGoal(goalId);
            if (res) {
              Alert.alert("Ukończono", `Zdobyto XP: ${res.total_xp}`);
              loadUserGoals(userId, selectedPeriod);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={{ flex: 1, padding: 12, backgroundColor: colors.background }}
    >
      {/* Period selector */}
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
            <AppText
              style={{ fontWeight: "bold", textTransform: "capitalize" }}
            >
              {p}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA GOALÓW */}
      <FlatList
        data={goalsForPeriod}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isCompleted = completedGoalIds.has(item.id);

          return (
            <TouchableOpacity
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
                      <AppText style={{ color: "#fff" }}>Ukończ</AppText>
                    </TouchableOpacity>
                  )}
                </View>

                <AppText
                  style={{
                    color: isCompleted ? "#777" : colors.text,
                    textDecorationLine: isCompleted
                      ? "line-through"
                      : "none",
                  }}
                >
                  {item.description}
                </AppText>

                <AppText
                  style={{
                    marginTop: 6,
                    color: isCompleted ? "#777" : colors.text,
                  }}
                >
                  {xpGain(item)} XP
                </AppText>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <AppText>Brak celów na ten okres</AppText>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* PROGRESS BAR #1 */}
      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 120,
        }}
      >
        <HeaderText style={{ marginBottom: 8 }}>
          Goals Progress: {Math.round(progress * 100)}%
        </HeaderText>
        <View
          style={{
            height: 10,
            backgroundColor: colors.card,
            borderRadius: 6,
          }}
        >
          <View
            style={{
              height: 10,
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: colors.buttonActive,
              borderRadius: 6,
            }}
          />
        </View>
      </View>

      {/* PROGRESS BAR #2 (CZASOWY) */}
      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 60,
        }}
      >
        <HeaderText style={{ marginBottom: 8 }}>
          Time Progress ({selectedPeriod}):{" "}
          {Math.round(timeProgress * 100)}%
        </HeaderText>
        <View
          style={{
            height: 10,
            backgroundColor: colors.card,
            borderRadius: 6,
          }}
        >
          <View
            style={{
              height: 10,
              width: `${Math.round(timeProgress * 100)}%`,
              backgroundColor: colors.buttonActive,
              borderRadius: 6,
            }}
          />
        </View>
      </View>

      {/* Floating add button */}
      <TouchableOpacity
        onPress={() => router.push("/addGoal")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 100,
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
