// frontend/app/(tabs)/GamificationScreen.tsx

import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../constants/theme";
import Svg, { Circle } from "react-native-svg";
import { api } from "../api/apiClient"

const SIZE = 180; // średnica kółka
const STROKE_WIDTH = 10; // grubość okręgu

export default function GamificationScreen() {
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const userId = 1;

  const fetchUser = async () => {
    try {
      const res = await api.get(`/gamification/users/${userId}/`);
      setTotalXp(res.data.total_xp);
      setLevel(res.data.current_level);
    } catch (err) {
      console.log(err);
    }
  };

  const addXp = async (amount: number) => {
    try {
      const res = await api.patch(`/gamification/users/${userId}/add-xp/`, { xp: amount });

      setTotalXp(res.data.total_xp);
      setLevel(res.data.current_level);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(useCallback(() => { fetchUser(); }, []));

  // --- Obliczenia dla progresu ---
  const xpForLevel = (lvl: number) => 50 * lvl * (lvl - 1);
  const currentLevelXpStart = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpIntoLevel = totalXp - currentLevelXpStart;
  const xpNeededForNext = nextLevelXp - currentLevelXpStart;
  const progress = Math.min(xpIntoLevel / xpNeededForNext, 1);

  const radius = (SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: spacing.l }}>
        <Svg width={SIZE} height={SIZE}>
          {/* tło okręgu */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke={colors.card}
            strokeWidth={STROKE_WIDTH}
          />
          {/* progres */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            stroke={colors.buttonActive}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            originX={SIZE / 2}
            originY={SIZE / 2}
          />
        </Svg>
        {/* liczba poziomu w środku */}
        <View style={[StyleSheet.absoluteFillObject, styles.levelTextContainer]}>
          <Text style={styles.levelText}>{level}</Text>
          <Text style={styles.totalXpText}>{totalXp} XP</Text>
        </View>
      </View>

      {/* przycisk testowy */}
      <TouchableOpacity style={styles.button} onPress={() => addXp(50)}>
        <Text style={styles.buttonText}>add 50 XP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.m,
  },
  levelTextContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  levelText: {
    fontSize: 50,
    fontWeight: "bold",
    color: colors.text,
  },
  totalXpText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.buttonActive,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.md,
    alignItems: "center",
  },
  buttonText: {
    color: colors.text,
    fontWeight: "bold",
  },
});
