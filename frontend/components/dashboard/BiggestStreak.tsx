import React from "react";
import { TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";
import { BestHabitStreak } from "../../app/stores/useHabitStore";

type Props = {
  streak: BestHabitStreak | null;
  onPress: () => void;
  onEditHabit?: (habitId: number) => void;
};

export function BiggestStreakTile({
  streak,
  onPress,
  onEditHabit,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() =>
        streak?.habit_id && onEditHabit?.(streak.habit_id)
      }
      style={{
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12
      }}
    >
      <AppText style={{ fontWeight: "700" }}>Biggest streak</AppText>

      {streak?.title ? (
        <AppText>
          {streak.title} • {streak.biggest_streak} dni
        </AppText>
      ) : (
        <AppText style={{ opacity: 0.6 }}>no streak</AppText>
      )}
    </TouchableOpacity>
  );
}
