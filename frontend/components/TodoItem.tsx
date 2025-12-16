// frontend/components/TodoItem.tsx

import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import AppText from "./AppText";
import { components, spacing } from "../constants/theme";
export default function TodoItem({ item, onComplete, onDelete, onLongPress }: any) {
  return (
    <TouchableOpacity
      onLongPress={onLongPress} // <-- tutaj
      activeOpacity={0.8}
      style={{ ...components.container, marginBottom: spacing.s }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <AppText style={{ fontWeight: "bold", textDecorationLine: item.is_completed ? "line-through" : "none" }}>
          {item.content} ({item.custom_difficulty ? item.custom_difficulty.xp_value : item.category?.difficulty?.xp_value} XP)
        </AppText>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!item.is_completed && (
            <TouchableOpacity onPress={() => onComplete(item.id)} style={components.completeButton}>
              <AppText style={{ color: "#fff" }}>＋</AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => {
            Alert.alert("Usuń zadanie?", item.content, [
              { text: "Anuluj", style: "cancel" },
              { text: "Usuń", style: "destructive", onPress: () => onDelete(item.id) }
            ]);
          }} style={{ marginLeft: 8 }}>
            <AppText>🗑️</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
