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

export default function DashboardScreen() {
  const router = useRouter();

  /* ===== STORES ===== */
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
  const { pickRandomTask } = useTodoStore();
  const { randomNote, refreshRandomNote } = useNotesStore();

  /* ===== LOCAL UI STATE ===== */
  const [loading, setLoading] = useState(true);
  const [goalWeek, setGoalWeek] = useState<any | null>(null);
  const [goalMonth, setGoalMonth] = useState<any | null>(null);
  const [goalYear, setGoalYear] = useState<any | null>(null);
  const [randomTodo, setRandomTodo] = useState<any | null>(null);
  const [randomHabit, setRandomHabit] = useState<RandomHabitSummary | null>(null);


  const GOAL_CONFIG: {
    key: DashboardTileKey;
    label: string;
    goal: any | null;
  }[] = [
    {
      key: "goal_week",
      label: "Random week goal",
      goal: goalWeek,
    },
    {
      key: "goal_month",
      label: "Random month goal",
      goal: goalMonth,
    },
    {
      key: "goal_year",
      label: "Random year goal",
      goal: goalYear,
    },
  ];


  /* ===== FETCH ORCHESTRATION ===== */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchModules?.(),
        fetchUser?.(),
        fetchActive?.(),
        fetchStreaks?.(),
        refreshRandomNote?.(),
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

      const todo = await pickRandomTask?.();
      setRandomTodo(todo ?? null);

      const rh = useHabitStore.getState().getRandomHabitSummary();
      setRandomHabit(rh);

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

  /* ===== LOADING ===== */
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

      {GOAL_CONFIG.map(({ key, label, goal }) =>
          canRenderTile(key) ? (
            <RandomGoalTile
              key={key}
              label={label}
              goal={goal}
              onPress={() =>
                router.push({
                  pathname: "/editGoal/[id]",
                  params: { id: String(goal.id) },
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
              const todo = await pickRandomTask?.();
              setRandomTodo(todo ?? null);
            }}
            onEdit={(id) =>
              router.push({
                pathname: "/editTodo/[id]",
                params: { id: String(id) },
              })
            }
          />
        )}

        {canRenderTile("random_note") && (
          <RandomNoteTile
            note={randomNote}
            onRefresh={refreshRandomNote}
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
            onOpenHabits={() => router.push("/HabitsScreen")}
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