import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useHabitStore } from "../stores/useHabitStore";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import HabitItem from "../../features/habits/HabitItem";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import FloatingButton from "../../components/FloatingButton";

export default function HabitsScreen() {
  const router = useRouter();

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const {
    habits,
    loading,
    loadMonth,
    loadDifficulties,
    toggleDay,
  } = useHabitStore();

  const [month, setMonth] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadDifficulties();
  }, []);

  useEffect(() => {
    loadMonth(month);
  }, [month]);

  const onToggleToday = async (habitId: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await toggleDay(habitId, today);

    if (!res) {
      Alert.alert("Error", "Cannot save day.");
      return;
    }

    if (res.already_completed) {
      if (gamificationOn) {
        Alert.alert("Info", "This habit was already marked for today.");
      }
    } else if (res.xp_gained > 0 && gamificationOn) {
      useGamificationStore.getState().applyXpResult(res);
    }

    await loadMonth(month, { silent: true });
  };

  const onToggleDay = async (
    habitId: number,
    date: string,
    newStatus: number
  ) => {
    const res = await toggleDay(habitId, date, newStatus);

    if (!res) {
      Alert.alert("Error", "Cannot save day");
      return;
    }

    if (res.xp_gained > 0 && gamificationOn) {
      useGamificationStore.getState().applyXpResult(res);
    }

    await loadMonth(month, { silent: true });
  };


  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const base = month
              ? new Date(month + "-01")
              : new Date();
            base.setMonth(base.getMonth() - 1);
            setMonth(
              `${base.getFullYear()}-${(base.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            );
          }}
          style={{ padding: 8 }}
        >
          <AppText>{"<"}</AppText>
        </TouchableOpacity>

        <AppText>
          {month ?? new Date().toISOString().slice(0, 7)}
        </AppText>

        <TouchableOpacity
          onPress={() => {
            const base = month
              ? new Date(month + "-01")
              : new Date();
            base.setMonth(base.getMonth() + 1);
            setMonth(
              `${base.getFullYear()}-${(base.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`
            );
          }}
          style={{ padding: 8 }}
        >
          <AppText>{">"}</AppText>
        </TouchableOpacity>
      </View>

      {loading.list ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.buttonActive} />
        </View>
      ) : habits.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <AppText style={{ color: "#777", fontSize: 16 }}>
            no habits yet, add some!
          </AppText>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HabitItem
              item={item}
              onToggleToday={onToggleToday}
              onToggleDay={onToggleDay}
            />
          )}
          contentContainerStyle={{ paddingBottom: 140 }}
        />
      )}

      <FloatingButton onPress={() => router.push("/addHabit")} />
    </View>
  );
}
