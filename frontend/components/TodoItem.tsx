import React, { useRef } from "react";
import { View, Alert, Pressable, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import AppText from "./AppText";
import { components, spacing, colors } from "../constants/theme";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";

export default function TodoItem({ item, onComplete, onDelete, onLongPress }: any) {
  const swipeRef = useRef<Swipeable>(null);
  const isCompleted = item.is_completed;

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
        style={({ pressed }) => [
          styles.container,
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <AppText
                style={{
                  textDecorationLine: isCompleted ? "line-through" : "none",
                  color: isCompleted ? "#777" : colors.text,
                }}
              >
                {item.content}
              </AppText>
            </View>

            {gamificationOn && item.custom_difficulty && (
              <AppText
                style={{
                  fontWeight: "normal",
                  color: isCompleted ? "#777" : colors.light,
                  textAlign: "right",
                }}
              >
                ({item.custom_difficulty.name})
              </AppText>
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    ...components.container,
    marginBottom: spacing.s,
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
