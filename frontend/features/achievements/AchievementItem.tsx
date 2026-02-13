import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { colors, components } from "../../constants/theme";
import { UserAchievement } from "../../app/stores/useAchievementStore";
import { useAchievementStore } from "../../app/stores/useAchievementStore";

type Props = {
  item: UserAchievement;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function AchievementItem({ item, onPress, onLongPress }: Props) {
  const { achievement, progress_percent, is_completed } = item;
  const { unlockManualAchievement } = useAchievementStore();

  const isManual = achievement.condition_type === "manual";

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={{ ...components.container, opacity: is_completed ? 0.85 : 1 }}>

        <AppText style={{ fontWeight: "bold", marginBottom: 4 }}>
          {achievement.name}
        </AppText>

        {achievement.description ? (
          <AppText style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>
            {achievement.description}
          </AppText>
        ) : null}

        {/* MANUAL BUTTON */}
        {isManual && !is_completed && (
          <TouchableOpacity
            onPress={() => unlockManualAchievement(achievement.id)}
            style={{
              marginTop: 8,
              backgroundColor: colors.buttonActive,
              padding: 8,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff" }}>
              unlock
            </AppText>
          </TouchableOpacity>
        )}

        {!is_completed && !isManual && (
          <>
            <View style={{
              height: 6,
              backgroundColor: colors.background,
              borderRadius: 4,
              marginBottom: 6,
            }}>
              <View style={{
                height: 6,
                width: `${progress_percent}%`,
                backgroundColor: colors.buttonActive,
              }} />
            </View>

            <AppText style={{ fontSize: 12, color: "#777" }}>
              {item.current_value} / {item.target_value}
            </AppText>
          </>
        )}

        {is_completed && (
          <AppText style={{ fontSize: 12, color: colors.buttonActive }}>
            unlocked
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
}