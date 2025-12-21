import React, { useState } from "react";
import { View, Modal, TouchableOpacity, TextInput, Alert } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { api } from "../api/apiClient";
import CustomDifficultyPicker from "./customDifficultyPicker";

export default function EditTodoPopup({ item, onClose, onSaved, onDelete }: any) {
  const [content, setContent] = useState(item.content);
  const [difficulty, setDifficulty] = useState(item.custom_difficulty || null);
  const [showDifficulty, setShowDifficulty] = useState(false);

  const save = async () => {
    try {
      await api.patch(`/todos/tasks/${item.id}/`, {
        content,
        custom_difficulty_id: difficulty?.id || null,
      });
      onSaved();
    } catch {
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete task?",
      item.content,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await onDelete(item.id);
            onClose();
          },
        },
      ]
    );
  };

  const buttonStyle = {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center" as const,
  };

  return (
    <Modal transparent animationType="fade" visible>
      {showDifficulty && (
        <CustomDifficultyPicker
          onSelect={(d) => {
            setDifficulty(d);
            setShowDifficulty(false);
          }}
          onClose={() => setShowDifficulty(false)}
        />
      )}

      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <AppText style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
            Edit task
          </AppText>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Task content"
            placeholderTextColor="#777"
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
              color: colors.text,
            }}
          />

          <TouchableOpacity
            onPress={() => setShowDifficulty(true)}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive,
            }}
          >
            <AppText style={{ color: "#fff" }}>
              {difficulty ? difficulty.name : "Set difficulty"}
            </AppText>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={confirmDelete}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive
            }}
          >
            <AppText style={{ color: "#fff" }}>Delete task</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={save}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive,
            }}
          >
            <AppText style={{ color: "#fff" }}>Save</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive,
              marginBottom: 0,
            }}
          >
            <AppText style={{ color: "#fff" }}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
