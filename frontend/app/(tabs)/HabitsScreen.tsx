import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Alert } from "react-native";
import { useHabitStore } from "../stores/useHabitStore";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import HabitItem from "../../components/HabitItem";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";

const userId = 1;

export default function HabitsScreen() {

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const router = useRouter();
  const {
    habits,
    loadMonth,
    loadDifficulties,
    toggleDay,
    loading,
  } = useHabitStore();

  const [month, setMonth] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadDifficulties();
    loadMonth(userId, month);
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
      useGamificationStore
        .getState()
        .applyXpResult(res);
    }
    await loadMonth(userId, month);
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
      useGamificationStore
        .getState()
        .applyXpResult(res);
    }


    await loadMonth(userId, month);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {/* HEADER MONTH NAV */}
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

        <HeaderText>
          {month ?? new Date().toISOString().slice(0, 7)}
        </HeaderText>

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

      {/* LIST */}
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
        ListEmptyComponent={() => (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
                <AppText style={{ color: "#777", fontSize: 16 }}>
                  no habits yet, add some!
                </AppText>
              </View>
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshing={loading}
        onRefresh={() => loadMonth(userId, month)}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/addHabit")}
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
