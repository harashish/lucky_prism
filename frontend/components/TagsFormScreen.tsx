// frontend/components/TagsFormScreen.tsx

import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AppText from "../components/AppText";
import { colors, radius } from "../constants/theme";
import { api } from "../app/api/apiClient"; // import instancji Axios

type Props = {
  editingTagId?: number;
};

const TagsFormScreen = ({ editingTagId }: Props) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTagId) {
      const fetchTag = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/challenges/tags/${editingTagId}/`);
          setName(res.data.name);
        } catch (err: any) {
          console.error(err);
          setError("Nie udało się pobrać tagu");
        } finally {
          setLoading(false);
        }
      };
      fetchTag();
    }
  }, [editingTagId]);

  const saveTag = async () => {
    if (!name) {
      setError("Podaj nazwę tagu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingTagId) {
        await api.patch(`/challenges/tags/${editingTagId}/`, { name });
      } else {
        await api.post("/challenges/tags/", { name });
      }
      router.back();
    } catch (err: any) {
      console.error(err);
      setError("Nie udało się zapisać tagu");
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async () => {
    if (!editingTagId) return;
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/challenges/tags/${editingTagId}/`);
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.detail;
      if (msg) setError(msg);
      else setError("Nie udało się usunąć tagu");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      {error && <AppText style={{ color: "#f44336", marginBottom: 12 }}>{error}</AppText>}

      <AppText style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, color: colors.text }}>
        {editingTagId ? "Edit tag" : "Add tag"}
      </AppText>

      <AppText style={{ color: colors.text, marginBottom: 6 }}>Tag name:</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        //placeholder="Tag name"
        placeholderTextColor="#7a7891"
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: radius.md,
          padding: 10,
          marginBottom: 16,
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={saveTag}
        style={{
          backgroundColor: colors.buttonActive,
          padding: 16,
          borderRadius: radius.md,
          alignItems: "center",
          marginBottom: editingTagId ? 12 : 0
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            {editingTagId ? "Save" : "Add tag"}
          </AppText>
        )}
      </TouchableOpacity>

      {editingTagId && (
        <TouchableOpacity
          onPress={deleteTag}
          style={{
            backgroundColor: colors.deleteButton,
            padding: 16,
            borderRadius: radius.md,
            alignItems: "center",
          }}
          disabled={loading}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete tag</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default TagsFormScreen;
