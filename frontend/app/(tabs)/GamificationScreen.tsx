import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  UIManager,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { colors, spacing } from "../../constants/theme";
import { api } from "../api/apiClient";
import { useGamificationStore } from "../stores/useGamificationStore";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SIZE = 180;
const STROKE_WIDTH = 9;

export default function GamificationScreen() {

  const { totalXp, currentLevel: level, fetchUser } =
    useGamificationStore();

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchLogs();
    }, [])
  );

  const [xpLogs, setXpLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await api.get("/gamification/me/");
      const sorted = (res.data.logs || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
      setXpLogs(sorted);
    } catch (e) {
      console.log("fetchLogs error", e);
    }
  };

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
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radiusCircle}
            stroke={colors.card}
            strokeWidth={STROKE_WIDTH}
          />
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

        <View style={[StyleSheet.absoluteFillObject, styles.levelTextContainer]}>
          <Text style={styles.levelText}>{level}</Text>
          <Text style={styles.totalXpText}>{totalXp} XP</Text>
        </View>
      </View>

      <Text style={{ marginBottom: spacing.m, color: colors.text }}>
        Left to the next level: {xpNeededForNext - xpIntoLevel} XP
      </Text>

      <FlatList
        style={{ marginTop: spacing.l, width: "100%" }}
        data={xpLogs.slice(0, 20)}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={{ color: "#777", textAlign: "center", marginTop: 20 }}>
            No XP activity yet
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Text style={{ color: colors.text }}>
              +{item.xp} XP • {item.source}
            </Text>
            <Text style={{ fontSize: 10, color: "#777" }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
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
  logItem: {
    padding: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
