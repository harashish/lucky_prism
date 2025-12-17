// frontend/app/(tabs)/GamificationScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, LayoutAnimation, Platform, UIManager } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, radius } from "../../constants/theme";
import Svg, { Circle } from "react-native-svg";
import { api } from "../api/apiClient"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SIZE = 180; // średnica kółka
const STROKE_WIDTH = 9; // grubość okręgu

export default function GamificationScreen() {
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpLogs, setXpLogs] = useState<any[]>([]);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const userId = 1;

  const fetchUser = async () => {
    try {
      const res = await api.get(`/gamification/users/${userId}/`);
      setTotalXp(res.data.total_xp);
      setLevel(res.data.current_level);

      // sortujemy logi od najnowszych
      const sortedLogs = (res.data.logs || []).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setXpLogs(sortedLogs);

      setXpLogs(res.data.logs || []);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedLogs(true); // automatycznie rozwijamy logi
    } catch (err) {
      console.log(err);
    }
  };

  const addXp = async (amount: number, source: string) => {
    try {
      const res = await api.patch(`/gamification/users/${userId}/add-xp/`, { xp: amount, source });

      setTotalXp(res.data.total_xp);
      setLevel(res.data.current_level);

      // odśwież logi
      fetchUser();
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

  const radiusCircle = (SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radiusCircle;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: spacing.l }}>
        <Svg width={SIZE} height={SIZE}>
          {/* tło okręgu */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radiusCircle}
            stroke={colors.card}
            strokeWidth={STROKE_WIDTH}
          />
          {/* progres */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radiusCircle}
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

      {/* ilość XP do next level */}
      <Text style={{ marginBottom: spacing.m, color: colors.text }}>
        Do następnego poziomu: {xpNeededForNext - xpIntoLevel} XP
      </Text>

      {/* przycisk testowy */}
      <TouchableOpacity style={styles.button} onPress={() => addXp(50, "test")}>
        <Text style={styles.buttonText}>add 50 XP</Text>
      </TouchableOpacity>

      {/* XP logi */}
      {expandedLogs && (
        <FlatList
          style={{ marginTop: spacing.l, width: "100%" }}
          data={xpLogs.slice(0, 20)} // ostatnie 5 wpisów
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={{ color: colors.text }}>
                +{item.xp} XP z {item.source} {item.source_id ? `(id:${item.source_id})` : ""}
              </Text>
              <Text style={{ fontSize: 10, color: "#777" }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
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
    marginBottom: spacing.m,
  },
  buttonText: {
    color: colors.text,
    fontWeight: "bold",
  },
  logItem: {
    padding: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
