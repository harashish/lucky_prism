import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import AppText from "./AppText";
import { useGamificationStore } from "../app/stores/useGamificationStore";
import { colors } from "../constants/theme";

export default function XPPopup() {
  const { xpPopup, clearXpPopup } = useGamificationStore();
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!xpPopup) return;

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
      ]).start(() => clearXpPopup());
    }, 1600);

    return () => clearTimeout(timer);
  }, [xpPopup]);

  if (!xpPopup) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.card}>
        <AppText style={styles.xpText}>+{xpPopup.xp} XP</AppText>
        {xpPopup.levelUp && (
          <AppText style={styles.levelUp}>LEVEL UP</AppText>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: "#8162a7ff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  xpText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  levelUp: {
    marginTop: 2,
    fontSize: 12,
    color: "#fff",
    opacity: 0.85,
  },
});
