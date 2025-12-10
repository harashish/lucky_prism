import React, { useState, useEffect } from "react";
import { View, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { api } from "../api/apiClient";
import { useTodoStore } from "../stores/useTodoStore";
import CustomDifficultyPicker from "./customDifficultyPicker";

export default function EditTodoPopup({ item, onClose, onSaved }: any) {
  const [content, setContent] = useState(item.content);
  const [difficultyId, setDifficultyId] = useState(item.custom_difficulty?.id || null);
  const [showDifficulty, setShowDifficulty] = useState(false);

  const save = async () => {
    try {
      await api.patch(`/todos/tasks/${item.id}/`, {
        content,
        custom_difficulty_id: difficultyId,
      });
      onSaved();
    } catch {
      Alert.alert("Błąd", "Nie udało się zapisać");
    }
  };

  return (
    <Modal transparent animationType="fade" visible>
      {showDifficulty && (
        <CustomDifficultyPicker
          onSelect={(id) => {
            setDifficultyId(id);
            setShowDifficulty(false);
          }}
          onClose={() => setShowDifficulty(false)}
        />
      )}

      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20
      }}>
        <View style={{
          width: "85%",
          backgroundColor: colors.card,
          borderRadius: 14,
          padding: 16
        }}>
          <AppText style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
            Edytuj zadanie
          </AppText>

          <TextInput
            value={content}
            onChangeText={setContent}
            style={{
              backgroundColor: colors.background,
              padding: 12,
              borderRadius: 10,
              marginBottom: 20,
              color: colors.text
            }}
          />

          <TouchableOpacity
            onPress={() => setShowDifficulty(true)}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.buttonActive,
              marginBottom: 20,
            }}
          >
            <AppText style={{ color: "#fff" }}>
              {difficultyId ? `Custom XP: ${difficultyId}` : "Ustaw trudność"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={save}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.buttonActive,
              marginBottom: 10
            }}
          >
            <AppText style={{ color: "#fff" }}>Zapisz</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 12, borderRadius: 10, backgroundColor: colors.card }}
          >
            <AppText style={{ color: colors.text }}>Anuluj</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
