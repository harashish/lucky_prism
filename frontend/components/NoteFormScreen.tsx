import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AppText from "./AppText";
import { colors, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";

export default function NoteEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [content, setContent] = useState("");

  useEffect(() => {
    if (id) {
      api.get(`/notes/${id}/`).then(res => {
        setContent(res.data.content);
      });
    }
  }, [id]);

  const save = async () => {
    if (!content.trim()) return;

    if (id) {
      await api.patch(`/notes/${id}/`, { content });
    } else {
      await api.post("/notes/", { content });
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}>
      <AppText style={{ fontWeight: "700", marginBottom: spacing.s }}>
        {id ? "Edytuj notatkę" : "Nowa notatka"}
      </AppText>

      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Treść notatki..."
        style={{
          flex: 1,
          backgroundColor: colors.card,
          padding: spacing.m,
          borderRadius: 12,
          textAlignVertical: "top",
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={save}
        style={{
          marginTop: spacing.m,
          backgroundColor: colors.buttonActive,
          padding: spacing.m,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <AppText style={{ color: "#fff", fontWeight: "700" }}>Zapisz</AppText>
      </TouchableOpacity>
    </View>
  );
}
