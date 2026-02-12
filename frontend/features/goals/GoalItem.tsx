import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { colors, components, radius } from "../../constants/theme";
import { ItemDetails } from "../../components/ItemDetails";
import { useState } from "react";
import { TextInput } from "react-native";

type GoalItemProps = {
  item: any;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onEdit: () => void;
  toggleStep: (goalId: number, stepId: number) => Promise<boolean>;
};

export default function GoalItem({
  item,
  isCompleted,
  isExpanded,
  onToggleExpand,
  onComplete,
  onEdit,
  toggleStep,
}: GoalItemProps) {

  const [newStepTitle, setNewStepTitle] = useState("");

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
  <>
    <ItemDetails
      description={item.description}
      motivation={item.motivation_reason}
    />

        {/* THRESHOLDS */}
    {(item.floor_goal || item.target_goal || item.ceiling_goal) && (
      <View style={{ marginTop: 10 }}>
        {item.floor_goal ? (
          <AppText style={{ fontSize: 12, color: "#aaa" }}>
            Floor: {item.floor_goal}
          </AppText>
        ) : null}

        {item.target_goal ? (
          <AppText style={{ fontSize: 12 }}>
            Target: {item.target_goal}
          </AppText>
        ) : null}

        {item.ceiling_goal ? (
          <AppText style={{ fontSize: 12, color: "#aaa" }}>
            Ceiling: {item.ceiling_goal}
          </AppText>
        ) : null}
      </View>
    )}

    {/* STEPS */}
    {item.steps?.length > 0 && (
      <View style={{ marginTop: 10 }}>
        {item.steps.map((step: any) => (
          <TouchableOpacity
            key={step.id}
            onPress={() => toggleStep(item.id, step.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                marginRight: 8,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#aaa",
                backgroundColor: step.is_completed ? colors.buttonActive : "transparent",
              }}
            />
            <AppText
              style={{
                textDecorationLine: step.is_completed ? "line-through" : "none",
                color: step.is_completed ? "#777" : colors.text,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
                opacity: step.is_completed ? 0.5 : 1,
                fontSize: 12
              }}
            >
              {step.title}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </>
)}
      </View>
    </TouchableOpacity>
  );
}
