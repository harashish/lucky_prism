import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  level: number;
  totalXp: number;
  onPress: () => void;
};

const xpForLevel = (lvl: number) => 50 * lvl * (lvl - 1);

export function LevelTile({ level, totalXp, onPress }: Props) {
  const nextLevelXp = xpForLevel(level + 1);
  const currentLevelXp = xpForLevel(level);
  const progress =
    (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp);

  const xpRemaining = Math.max(0, nextLevelXp - totalXp);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <AppText style={{ fontSize: 18, fontWeight: "700" }}>
          Lv {level}
        </AppText>
        <AppText style={{ fontSize: 14, color: "#777" }}>
          {xpRemaining} XP to next level
        </AppText>
      </View>

      <View
        style={{
          height: 12,
          backgroundColor: "#eee",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${Math.min(100, Math.round(progress * 100))}%`,
            height: 12,
            backgroundColor: colors.buttonActive,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
