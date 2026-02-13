import React, { useCallback } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { colors } from "../../constants/theme";
import AppText from "../../components/AppText";
import AchievementItem from "../../features/achievements/AchievementItem";
import { useAchievementStore } from "../stores/useAchievementStore";
import FloatingButton from "../../components/FloatingButton";

export default function AchievementScreen() {
  const router = useRouter();

  const { userAchievements, loadUserAchievements, loading } =
    useAchievementStore();

  useFocusEffect(
    useCallback(() => {
      loadUserAchievements();
    }, [])
  );

  const sorted = [...userAchievements].sort((a, b) => {
    if (a.is_completed && !b.is_completed) return -1;
    if (!a.is_completed && b.is_completed) return 1;
    return b.progress_percent - a.progress_percent;
  });

  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        backgroundColor: colors.background,
      }}
    >
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.buttonActive} />
        </View>
      ) : sorted.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <AppText style={{ color: "#777" }}>no achievements yet</AppText>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <AchievementItem
              item={item}
              onLongPress={() =>
                router.push(`/editAchievement/${item.achievement.id}`)
              }
            />
          )}
        />
      )}

      <FloatingButton onPress={() => router.push("/addAchievement")} />
    </View>
  );
}