import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { colors, spacing } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { DashboardTileKey, useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import { useChallengeStore } from "../stores/useChallengeStore";
import { RandomHabitSummary, useHabitStore } from "../stores/useHabitStore";
import { useGoalStore } from "../stores/useGoalStore";
import { useTodoStore } from "../stores/useTodoStore";
import { useNotesStore } from "../stores/useNotesStore";
import { LevelTile } from "../../components/dashboard/LevelTile";
import { BiggestStreakTile } from "../../components/dashboard/BiggestStreak";
import { RandomGoalTile } from "../../components/dashboard/RandomGoalTile";
import { DailyChallengeTile } from "../../components/dashboard/DailyChallengeTile";
import { WeeklyChallengeTile } from "../../components/dashboard/WeeklyChallengeTile";
import { RandomTodoTile } from "../../components/dashboard/RandomTodoTile";
import { RandomNoteTile } from "../../components/dashboard/RandomNoteTile";
import { RandomHabitTile } from "../../components/dashboard/RandomHabitTile";
import EditTodoPopup from "../../features/todos/editTodoPopup";

export default function DashboardScreen() {
  const router = useRouter();

  const { dashboardTiles, modules, fetchModules } = useModuleSettingsStore();

  const {
    totalXp,
    currentLevel: level,
    fetchUser,
  } = useGamificationStore();

  const {
    fetchActive,
    activeDaily,
    activeWeekly,
  } = useChallengeStore();

  const {
    fetchStreaks,
    biggestStreak,
    loadMonth,
  } = useHabitStore();

  const { pickRandomGoal } = useGoalStore();
  const { fetchRandomTask } = useTodoStore();
  const { randomNote, fetchRandomNote } = useNotesStore();
  const [loading, setLoading] = useState(true);
  const [goalWeek, setGoalWeek] = useState<any | null>(null);
  const [goalMonth, setGoalMonth] = useState<any | null>(null);
  const [goalYear, setGoalYear] = useState<any | null>(null);
  const [randomTodo, setRandomTodo] = useState<any | null>(null);
  const [randomHabit, setRandomHabit] = useState<RandomHabitSummary | null>(null);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);

  const GOAL_CONFIG: {
    key: DashboardTileKey;
    label: string;
    goal: any | null;
    period: "weekly" | "monthly" | "yearly";
  }[] = [
    {
      key: "goal_week",
      label: "Random week goal",
      goal: goalWeek,
      period: "weekly",
    },
    {
      key: "goal_month",
      label: "Random month goal",
      goal: goalMonth,
      period: "monthly",
    },
    {
      key: "goal_year",
      label: "Random year goal",
      goal: goalYear,
      period: "yearly",
    },
  ];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchModules?.(),
        fetchUser?.(),
        fetchActive?.(),
        fetchStreaks?.(),
        fetchRandomNote?.(),
        loadMonth?.(),
      ]);

      const [gw, gm, gy] = await Promise.all([
        pickRandomGoal?.("weekly"),
        pickRandomGoal?.("monthly"),
        pickRandomGoal?.("yearly"),
      ]);

      setGoalWeek(gw ?? null);
      setGoalMonth(gm ?? null);
      setGoalYear(gy ?? null);

      const todo = await fetchRandomTask?.();
      setRandomTodo(todo ?? null);

      const rh = await useHabitStore
        .getState()
        .pickRandomHabitSummary();

      setRandomHabit(rh ?? null);


    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );


  const canRenderTile = (key: DashboardTileKey) => {
    const tile = dashboardTiles?.find(
      (t: any) => t.key === key || t.id === key
    );
    if (!tile || !tile.is_enabled) return false;

    if (tile.module_dependency) {
      return modules?.[tile.module_dependency] === true;
    }

    return true;
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background}} contentContainerStyle={{
      paddingBottom: 30,
    }}>

      {editingTodo && (
        <EditTodoPopup
          item={editingTodo}
          onClose={async () => {
            setEditingTodo(null);

            const refreshed = await fetchRandomTask?.();
            setRandomTodo(refreshed ?? null);
          }}
        />
      )}


      {canRenderTile("level_gamification") && (
        <LevelTile
          level={level}
          totalXp={totalXp}
          onPress={() => router.push("/GamificationScreen")}
        />
      )}


      {canRenderTile("biggest_streak") && (
        <BiggestStreakTile
          streak={biggestStreak}
          onPress={() => router.push("/HabitsScreen")}
          onEditHabit={(id) =>
            router.push({
              pathname: "/editHabit/[id]",
              params: { id: String(id) },
            })
          }
        />
      )}

      {GOAL_CONFIG.map(({ key, label, goal, period }) =>
          canRenderTile(key) ? (
            <RandomGoalTile
              key={key}
              label={label}
              goal={goal}
              onRefresh={async () => {
                const next = await pickRandomGoal?.(period);
                if (!next) return;

                if (period === "weekly") setGoalWeek(next);
                if (period === "monthly") setGoalMonth(next);
                if (period === "yearly") setGoalYear(next);
              }}
              onEditGoal={(id) =>
                router.push({
                  pathname: "/editGoal/[id]",
                  params: { id: String(id) },
                })
              }
            />
          ) : null
        )}

        {canRenderTile("daily_challenge") && (
          <DailyChallengeTile
            activeDaily={activeDaily}
            onGoToActive={() => router.push("/random/daily/active")}
            onRandomize={() => router.push("/random/daily")}
            onEdit={(id) =>
              router.push({
                pathname: "/editChallenge/[id]",
                params: { id: String(id) },
              })
            }
          />
        )}

        {canRenderTile("weekly_challenge") && (
          <WeeklyChallengeTile
            activeWeekly={activeWeekly}
            onGoToActive={() => router.push("/random/weekly/active")}
            onRandomize={() => router.push("/random/weekly")}
            onEdit={(id) =>
              router.push({
                pathname: "/editChallenge/[id]",
                params: { id: String(id) },
              })
            }
          />
        )}

        {canRenderTile("random_todo") && (
          <RandomTodoTile
            todo={randomTodo}
            onRefresh={async () => {
              const todo = await fetchRandomTask?.();
              setRandomTodo(todo ?? null);
            }}
            onEdit={(todo) => setEditingTodo(todo)}
          />
        )}


        {canRenderTile("random_note") && (
          <RandomNoteTile
            note={randomNote}
            onRefresh={fetchRandomNote}
            onEdit={(id) =>
              router.push({
                pathname: "/editNote/[id]",
                params: { id: String(id) },
              })
            }
            onAdd={() => router.push("/addNote")}
          />
        )}

        {canRenderTile("random_habit") && (
          <RandomHabitTile
            habit={randomHabit}
            onRefresh={async () => {
              const rh = await useHabitStore
                .getState()
                .pickRandomHabitSummary();
              setRandomHabit(rh ?? null);
            }}
            onEdit={(id) =>
              router.push({
                pathname: "/editHabit/[id]",
                params: { id: String(id) },
              })
            }
          />
        )}

    </ScrollView>
  );
}