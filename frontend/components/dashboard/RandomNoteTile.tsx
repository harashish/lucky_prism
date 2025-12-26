import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  note: any | null;
  onRefresh: () => void;
  onEdit: (id: number) => void;
  onAdd: () => void;
};

export function RandomNoteTile({
  note,
  onRefresh,
  onEdit,
  onAdd,
}: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        Note
      </AppText>

      <View style={{ flexDirection: "row", alignItems: "stretch" }}>
        {note ? (
          <TouchableOpacity
            onPress={onRefresh}
            onLongPress={() => onEdit(note.id)}
            style={{
              flex: 1,
              backgroundColor: colors.card,
              padding: 14,
              borderRadius: 12,
              marginRight: 8,
            }}
          >
            <AppText>{note.content}</AppText>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              padding: 14,
              borderRadius: 12,
              marginRight: 8,
              justifyContent: "center",
            }}
          >
            <AppText style={{ opacity: 0.6 }}>No notes</AppText>
          </View>
        )}

        <TouchableOpacity
          onPress={onAdd}
          style={{
            width: 44,
            borderRadius: 10,
            backgroundColor: colors.buttonActive,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 22 }}>+</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
