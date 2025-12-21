// frontend/app/(tabs)/DashboardScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import AppText from "../../components/AppText";
import { colors, spacing } from "../../constants/theme";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { api } from "../api/apiClient";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useFocusEffect } from "@react-navigation/native";
import { useGamificationStore } from "../stores/useGamificationStore";

const userId = 1;

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardTiles } = useModuleSettingsStore();

  const [loading, setLoading] = useState(true);
  const { totalXp, currentLevel: level } = useGamificationStore();
  const [biggestStreak, setBiggestStreak] = useState<any>(null);
  const [goalWeek, setGoalWeek] = useState<any>(null);
  const [goalMonth, setGoalMonth] = useState<any>(null);
  const [goalYear, setGoalYear] = useState<any>(null);
  const [randomTodo, setRandomTodo] = useState<any>(null);
  const [randomHabit, setRandomHabit] = useState<any>(null);
  const [activeDaily, setActiveDaily] = useState<any | null>(null);
  const [activeWeekly, setActiveWeekly] = useState<any[]>([]);
  const [randomNote, setRandomNote] = useState<any | null>(null);
  const [noteExpanded, setNoteExpanded] = useState(false);
  const fetchRandomTodo = async () => {
    try {
      const res = await api.get(`/todos/tasks/random/?user_id=${userId}`);
      setRandomTodo(res.data);
    } catch {
      setRandomTodo(null);
    }
  };

  // w DashboardScreen dodaj funkcję:
const fetchRandomNote = async () => {
  try {
    const res = await api.get("/notes/random/");
    setRandomNote(res.data);
  } catch {
    setRandomNote(null);
  }
};

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {

      const st = await api.get(`/habits/user-habits/${userId}/streaks/`);
      setBiggestStreak(st.data);

      const pick = (arr: any[]) => arr?.length ? arr[Math.floor(Math.random() * arr.length)] : null;

      const [gw, gm, gy] = await Promise.all([
        api.get(`/goals/user-goals/${userId}/?period=weekly`),
        api.get(`/goals/user-goals/${userId}/?period=monthly`),
        api.get(`/goals/user-goals/${userId}/?period=yearly`),
      ]);

      setGoalWeek(pick(gw.data));
      setGoalMonth(pick(gm.data));
      setGoalYear(pick(gy.data));

      await fetchRandomTodo();

      const ac = await api.get(`/challenges/active/${userId}/`);
      setActiveDaily(ac.data.daily ?? null);
      setActiveWeekly(ac.data.weekly ?? []);

      const hm = await api.get(`/habits/user-habits/${userId}/month/?month=${new Date().toISOString().slice(0, 7)}`);
      if (hm.data.habits?.length) {
        const h = pick(hm.data.habits);
        setRandomHabit({
          id: h.id,
          title: h.title,
          reason: h.motivation_reason,
          done: h.days.filter((d: any) => d.status === 2).length,
          total: h.days.length,
        });
      }

      try {
        const rn = await api.get("/notes/random/");
        setRandomNote(rn.data);
      } catch {
        setRandomNote(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

    useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  const xpForLevel = (lvl: number) => 50 * lvl * (lvl - 1);
  const xpRemaining = Math.max(0, xpForLevel(level + 1) - totalXp);

  const onLongPressActiveChallenge = (challengeId: number) => {
    router.push({ pathname: "/editChallenge/[id]", params: { id: String(challengeId) } });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  //const isTileEnabled = (key: string) => dashboardTiles.find(t => t.id === key && t.is_enabled);
  const isTileEnabled = (key: string) => (dashboardTiles || []).find((t:any) => (t.key === key || t.id === key) && t.is_enabled);


  return (
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}>

      {/* LEVEL */}
{useModuleSettingsStore.getState().modules?.gamification && (
  <TouchableOpacity
    onPress={() => router.push("/GamificationScreen")}
    style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, marginBottom: 20 }}
  >
    {/* Nagłówek: Level i XP */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
      <AppText style={{ fontSize: 18, fontWeight: "700" }}>Lv {level}</AppText>
      <AppText style={{ fontSize: 14, color: "#777" }}>{xpRemaining} XP to next level</AppText>
    </View>

    {/* Pasek postępu */}
    <View style={{ height: 12, backgroundColor: "#eee", borderRadius: 6, overflow: "hidden" }}>
      <View
        style={{
          width: `${Math.min(100, Math.round(((totalXp - xpForLevel(level)) / (xpForLevel(level + 1) - xpForLevel(level))) * 100))}%`,
          height: 12,
          backgroundColor: colors.buttonActive,
        }}
      />
    </View>
  </TouchableOpacity>
)}


{/* BIGGEST STREAK */}
{isTileEnabled("biggest_streak") && (
  <TouchableOpacity
    onPress={() => router.push("/HabitsScreen")}
    onLongPress={() => biggestStreak?.habit_id && router.push({ pathname: "/editHabit/[id]", params: { id: String(biggestStreak.habit_id) } })}
    style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 }}
  >
    <AppText style={{ fontWeight: "700" }}>Biggest streak</AppText>
    {biggestStreak && biggestStreak?.title ? (
      <AppText>{biggestStreak.title} • {biggestStreak.biggest_streak} dni</AppText>
    ) : (
      <AppText style={{ opacity: 0.6 }}>no habits - no streak</AppText>
    )}
  </TouchableOpacity>
)}


{/* GOALS */}
{["goal_week", "goal_month", "goal_year"].map((key, idx) => {
  const goal = [goalWeek, goalMonth, goalYear][idx];
  const label = ["Random week goal", "Random month goal", "Random year goal"][idx];

  if (!isTileEnabled(key) || !goal) return null;

  return (
    <View key={key} style={{ marginBottom: 16 }}>
      {/* HEADER – poza tile */}
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        {label}
      </AppText>

      {/* TILE – tylko treść */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/editGoal/[id]",
            params: { id: String(goal.id) },
          })
        }
        style={{
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <AppText style={{ fontWeight: "600" }}>
          {goal.title}
        </AppText>

        {goal.motivation_reason && (
          <AppText
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            {goal.motivation_reason}
          </AppText>
        )}
      </TouchableOpacity>
    </View>
  );
})}


      {/* DAILY CHALLENGE */}
      {isTileEnabled("daily_challenge") && (
        <View style={{ marginBottom: 12 }}>
          <AppText style={{ fontWeight: "700", marginBottom: 8 }}>Daily challenge</AppText>
          {activeDaily ? (
            <TouchableOpacity onPress={() => router.push("/random/daily/active")} onLongPress={() => onLongPressActiveChallenge(activeDaily.challenge.id)}
              style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10 }}>
              <AppText style={{ fontWeight: "700" }}>{activeDaily.challenge?.title}</AppText>
              <AppText numberOfLines={2}>{activeDaily.challenge?.description}</AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/random/daily")} style={{ backgroundColor: colors.buttonActive, padding: 12, borderRadius: 10 }}>
              <AppText style={{ color: "#fff", fontWeight: "700" }}>Randomize challenge</AppText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* WEEKLY CHALLENGE */}
      {isTileEnabled("weekly_challenge") && (
        <View style={{ marginBottom: 12 }}>
          <AppText style={{ fontWeight: "700", marginBottom: 8 }}>Week challenge</AppText>
          {activeWeekly && activeWeekly.length > 0 ? (
            activeWeekly.map((uc: any) => (
              <TouchableOpacity key={uc.id} onPress={() => router.push("/random/weekly/active")} onLongPress={() => onLongPressActiveChallenge(uc.challenge.id)}
                style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 8 }}>
                <AppText style={{ fontWeight: "700" }}>{uc.challenge?.title}</AppText>
                <View style={{ height: 8, backgroundColor: colors.background, borderRadius: 6, overflow: "hidden", marginTop: 8 }}>
                  <View style={{ width: `${Math.round(uc.progress_percent ?? 0)}%`, height: 8, backgroundColor: colors.buttonActive }} />
                </View>
                <AppText style={{ marginTop: 6 }}>{uc.progress_percent ?? 0}%</AppText>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity onPress={() => router.push("/random/weekly")} style={{ backgroundColor: colors.buttonActive, padding: 12, borderRadius: 10 }}>
              <AppText style={{ color: "#fff", fontWeight: "700" }}>Randomize challenge</AppText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* RANDOM TODO */}
      {isTileEnabled("random_todo") && (
        <>
          <AppText style={{ fontWeight: "700", marginBottom: 8 }}>Random todo</AppText>
          <TouchableOpacity onPress={fetchRandomTodo} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <AppText>{randomTodo?.content || "—"}</AppText>
          </TouchableOpacity>
        </>
      )}

{/* RANDOM NOTE */}
{isTileEnabled("random_note") && (
  <View style={{ marginBottom: 16 }}>
    <AppText style={{ fontWeight: "700", marginBottom: 8 }}>Note</AppText>

    <View style={{ flexDirection: "row", alignItems: "stretch" }}>
      {randomNote ? (
        <TouchableOpacity
          onPress={fetchRandomNote}
          onLongPress={() =>
            router.push({ pathname: "/editNote/[id]", params: { id: randomNote.id } })
          }
          style={{
            flex: 1,
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 12,
            marginRight: 8,
          }}
        >
          {/* FULL CONTENT – no trimming */}
          <AppText>{randomNote.content}</AppText>
        </TouchableOpacity>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            padding: 14,
            borderRadius: 12,
            marginRight: 8,
            justifyContent: "center",
          }}
        >
          <AppText style={{ opacity: 0.6 }}>No notes</AppText>
        </View>
      )}

      {/* PLUS – SQUARE, NOT PUSHED */}
      <TouchableOpacity
        onPress={() => router.push("/addNote")}
        style={{
          width: 44,
          borderRadius: 10,
          backgroundColor: colors.buttonActive,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AppText style={{ color: "#fff", fontSize: 22 }}>＋</AppText>
      </TouchableOpacity>
    </View>
  </View>
)}

      {/* RANDOM HABIT */}
      {isTileEnabled("random_habit") && randomHabit && (
  <>
    <AppText style={{ fontWeight: "700", marginBottom: 8 }}>Random habit</AppText>
    <TouchableOpacity
      onPress={() => router.push("/HabitsScreen")}
      onLongPress={() =>
        router.push({ pathname: "/editHabit/[id]", params: { id: String(randomHabit.id) } })
      }
      style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12 }}
    >
      <AppText style={{ fontWeight: "600" }}>
  {randomHabit.title}
</AppText>

{randomHabit.reason ? (
  <AppText style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
    {randomHabit.reason}
  </AppText>
) : null}

      <AppText style={{ marginTop: 6 }}>
        {randomHabit.done} / {randomHabit.total} days
      </AppText>
    </TouchableOpacity>
  </>
)}


    </ScrollView>
  );
}
