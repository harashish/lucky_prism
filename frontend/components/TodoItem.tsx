import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import AppText from "./AppText";
import { components, spacing, colors } from "../constants/theme";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";

export default function TodoItem({ item, onComplete, onDelete, onLongPress }: any) {
  const isCompleted = item.is_completed;

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={{ 
        ...components.container, 
        marginBottom: spacing.s, 
        marginHorizontal: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Tekst todo */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText
            style={{
              fontWeight: "bold",
              textDecorationLine: isCompleted ? "line-through" : "none",
              color: isCompleted ? "#777" : colors.text,
              flexWrap: "wrap",
            }}
          >
            {item.content}
            {gamificationOn && (
              ` (${item.custom_difficulty
                ? item.custom_difficulty.xp_value
                : item.category?.difficulty?.xp_value} XP)`
            )}
          </AppText>

        </View>

        

        {/* Przycisk wykonania i kosza */}
        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8, flexShrink: 0 }}>
          {!isCompleted && (
            <TouchableOpacity onPress={() => onComplete(item.id)} style={components.completeButton}>
              <AppText style={{ color: "#fff" }}>＋</AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Usuń zadanie?", item.content, [
                { text: "Anuluj", style: "cancel" },
                { text: "Usuń", style: "destructive", onPress: () => onDelete(item.id) }
              ]);
            }}
            style={{ marginLeft: 8 }}
          >
            <AppText>🗑️</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
