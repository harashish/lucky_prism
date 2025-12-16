import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, FlatList, Alert } from "react-native";
import { useHabitStore } from "../stores/useHabitStore";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import HabitItem from "../../components/HabitItem";

const userId = 1;

export default function HabitsScreen() {
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
      Alert.alert("Błąd", "Nie udało się zapisać dnia");
      return;
    }

    if (res.already_completed) {
      Alert.alert(
        "Info",
        "Ten habit był już oznaczony na dziś.\nXP nie jest cofane."
      );
    } else if (res.xp_added > 0) {
      Alert.alert("XP", `Otrzymano ${res.xp_added} XP`);
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
      Alert.alert("Błąd", "Nie udało się zapisać dnia");
      return;
    }

    if (res.xp_added > 0) {
      Alert.alert("XP", `Otrzymano ${res.xp_added} XP`);
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
          <AppText>Brak habitów. Dodaj nowy habit.</AppText>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshing={loading}
        onRefresh={() => loadMonth(userId, month)}
      />

      {/* ADD BUTTON */}
      <TouchableOpacity
        onPress={() => router.push("/addHabit")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 60,
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
