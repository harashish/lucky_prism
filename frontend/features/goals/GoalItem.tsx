import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { components } from "../../constants/theme";
import { ItemDetails } from "../../components/ItemDetails";

type GoalItemProps = {
  item: any;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onEdit: () => void;
};

export default function GoalItem({
  item,
  isCompleted,
  isExpanded,
  onToggleExpand,
  onComplete,
  onEdit,
}: GoalItemProps) {
  return (
    <TouchableOpacity
      onPress={onToggleExpand}
      onLongPress={onEdit}
    >
      <View
        style={{
          ...components.container,
          opacity: isCompleted ? 0.5 : 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
        <View style={{ flex: 1 }}>
        <AppText
            style={{
            fontWeight: "bold",
            textDecorationLine: isCompleted ? "line-through" : "none",
            }}
        >
            {item.title}
        </AppText>

        {item.difficulty?.name && (
            <AppText style={{ fontSize: 12, color: "#777" }}>
            {item.difficulty.name}
            </AppText>
        )}
        </View>
          {!isCompleted && (
            <TouchableOpacity
              onPress={onComplete}
              style={components.completeButton}
            >
              <AppText style={{ color: "#fff" }}>complete</AppText>
            </TouchableOpacity>
          )}
        </View>
        {isExpanded && (
          <ItemDetails
            description={item.description}
            motivation={item.motivation_reason}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
