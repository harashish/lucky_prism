import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  todo: any | null;
  onRefresh: () => void;
  onEdit: (id: number) => void;
};

export function RandomTodoTile({ todo, onRefresh, onEdit }: Props) {
  if (!todo) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        Random todo
      </AppText>

      <TouchableOpacity
        onPress={onRefresh}
        onLongPress={() => onEdit(todo)}
        delayLongPress={300}
        style={{
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <AppText>{todo.content}</AppText>
      </TouchableOpacity>
    </View>
  );
}
