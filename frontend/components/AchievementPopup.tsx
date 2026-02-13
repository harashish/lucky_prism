import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import AppText from "./AppText";
import { useAchievementStore } from "../app/stores/useAchievementStore";
import { colors } from "../constants/theme";

export default function AchievementPopup() {
  const { achievementPopup, clearAchievementPopup } = useAchievementStore();

  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!achievementPopup) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => clearAchievementPopup());
    }, 1800);

    return () => clearTimeout(timer);
  }, [achievementPopup]);

  if (!achievementPopup) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.card}>
        <AppText style={styles.title}>
          ACHIEVEMENT UNLOCKED
        </AppText>

        <AppText style={styles.name}>
          {achievementPopup.name}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.buttonActive,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  name: {
    marginTop: 4,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});