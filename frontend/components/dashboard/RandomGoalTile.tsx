import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  label: string;
  goal: any;
  onRefresh: () => void;
  onEditGoal?: (goalId: number) => void;
};

export function RandomGoalTile({ label, goal, onRefresh, onEditGoal }: Props) {
  if (!goal) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        {label}
      </AppText>

      <TouchableOpacity
        onPress={onRefresh}
        onLongPress={() => goal?.id && onEditGoal?.(goal.id)}
        delayLongPress={300}
        style={{
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <AppText style={{ fontWeight: "600" }}>
          {goal.title}
        </AppText>

        {goal.motivation_reason && (
          <AppText
            style={{
              fontSize: 13,
              opacity: 0.7,
              marginTop: 4,
            }}
          >
            {goal.motivation_reason}
          </AppText>
        )}

      </TouchableOpacity>
    </View>
  );
}
