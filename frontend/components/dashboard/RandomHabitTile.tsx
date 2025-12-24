import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type RandomHabit = {
  id: number;
  title: string;
  reason?: string;
  done: number;
  total: number;
};

type Props = {
  habit: RandomHabit | null;
  onOpenHabits: () => void;
  onEdit: (id: number) => void;
};

export function RandomHabitTile({ habit, onOpenHabits, onEdit }: Props) {
  if (!habit) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        Random habit
      </AppText>

      <TouchableOpacity
        onPress={onOpenHabits}
        onLongPress={() => onEdit(habit.id)}
        style={{
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <AppText style={{ fontWeight: "600" }}>
          {habit.title}
        </AppText>

        {habit.reason ? (
          <AppText
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            {habit.reason}
          </AppText>
        ) : null}

        <AppText style={{ marginTop: 6 }}>
          {habit.done} / {habit.total} days
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
