import React, { useRef } from "react";
import { View, Alert, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import AppText from "../../components/AppText";
import { components, spacing, colors } from "../../constants/theme";
import { useModuleSettingsStore } from "../../app/stores/useModuleSettingsStore";

export default function TodoItem({
  item,
  onComplete,
  onDelete,
  onLongPress,
}: {
  item: any;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onLongPress?: () => void;
  isDragging?: boolean;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const isCompleted = item.is_completed;

  const getDifficultyLetter = (name?: string) => {
    if (!name) return null;

    const map: Record<string, string> = {
      trivial: "T",
      easy: "E",
      medium: "M",
      hard: "H",
    };

    return map[name.toLowerCase()] || name[0]?.toUpperCase();
  };

  const difficultyName =
  item.custom_difficulty?.name ||
  item.category?.difficulty?.name;

  const difficultyLetter = getDifficultyLetter(difficultyName);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const confirmComplete = () => {
    swipeRef.current?.close();
    Alert.alert(
      "Complete task?",
      item.content,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => onComplete(item.id),
        },
      ]
    );
  };

  const confirmDelete = () => {
    swipeRef.current?.close();
    Alert.alert(
      "Delete task?",
      item.content,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  const renderLeftAction = () => (
    <View style={[styles.action, styles.complete]}>
      <AppText style={styles.actionText}>Complete</AppText>
    </View>
  );

  const renderRightAction = () => (
    <View style={[styles.action, styles.delete]}>
      <AppText style={styles.actionText}>Delete</AppText>
    </View>
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={!isCompleted ? renderLeftAction : undefined}
      renderRightActions={renderRightAction}
      leftThreshold={60}
      rightThreshold={60}
      onSwipeableLeftOpen={!isCompleted ? confirmComplete : undefined}
      onSwipeableRightOpen={confirmDelete}
      overshootFriction={6}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={150}
        style={({ pressed }) => [
          styles.container,
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 1.02 : 1 }],
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>

              {difficultyLetter && (
                <AppText
                  style={{
                    marginRight: 10,
                    fontWeight: "600",
                    color: colors.buttonActive,
                    opacity: isCompleted ? 0.5 : 1,
                  }}
                >
                  {difficultyLetter}
                </AppText>
              )}

              <AppText
                style={{
                  flex: 1,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                  color: isCompleted ? "#777" : colors.text,
                }}
              >
                {item.content}
              </AppText>

            </View>

          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
container: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.background,
},
  action: {
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    marginVertical: spacing.s,
    borderRadius: 10,
  },
  complete: {
    backgroundColor: colors.buttonActive,
  },
  delete: {
    backgroundColor: "#d9534f",
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
});
