import React, { useState } from "react";
import { View, Modal, TouchableOpacity, TextInput } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import CustomDifficultyPicker from "./customDifficultyPicker";
import { confirmDelete } from "../../components/confirmDelete";
import { useTodoStore } from "../../app/stores/useTodoStore";

export default function EditTodoPopup({ item, onClose }: any) {
  const { updateTask, deleteTask } = useTodoStore();

  const [content, setContent] = useState(item.content);
  const [difficulty, setDifficulty] = useState(item.custom_difficulty || null);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      await updateTask(item.id, {
        content: content.trim(),
        custom_difficulty_id: difficulty?.id || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = () => {
    confirmDelete({
      title: "Delete task?",
      message: item.content,
      onConfirm: async () => {
        setLoading(true);
        try {
          await deleteTask(item.id);
          onClose();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const buttonStyle = {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center" as const,
    opacity: loading ? 0.6 : 1,
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
            editable={!loading}
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
            disabled={loading}
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
            disabled={loading}
            onPress={deleteHandler}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive,
            }}
          >
            <AppText style={{ color: "#fff" }}>Delete task</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
            onPress={save}
            style={{
              ...buttonStyle,
              backgroundColor: colors.buttonActive,
            }}
          >
            <AppText style={{ color: "#fff" }}>Save</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={loading}
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
