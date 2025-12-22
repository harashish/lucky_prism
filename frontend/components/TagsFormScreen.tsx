import React, { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AppText from "../components/AppText";
import { colors, radius, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";
import FormErrorModal from "../components/FormErrorModal";
import { useLocalSearchParams } from "expo-router";

export type TagsFormScreenProps = {
  editingId?: number;
};


export default function TagsFormScreen({ editingId }: TagsFormScreenProps) {
  const { id } = useLocalSearchParams();
  const isEdit = typeof editingId === "number";
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingId) {
      const fetchTag = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/challenges/tags/${editingId}/`);
          setName(res.data.name);
        } catch (err: any) {
          console.error(err);
          setErrorMessage("Cannot load tag");
        } finally {
          setLoading(false);
        }
      };
      fetchTag();
    }
  }, [editingId]);

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter tag name");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.patch(`/challenges/tags/${editingId}/`, { name });
      } else {
        await api.post("/challenges/tags/", { name });
      }
      router.replace("/ChallengesListScreen");

    } catch (err: any) {
      console.error(err);
      setErrorMessage("Cannot save tag");
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async () => {
    if (!editingId) return;
    setLoading(true);

    try {
      await api.delete(`/challenges/tags/${editingId}/`);
      router.replace("/ChallengesListScreen");

    } catch (err: any) {
      const msg = err.response?.data?.detail;
      if (msg) setErrorMessage(msg);
      else setErrorMessage("Cannot delete tag");
    }
    finally {
      setLoading(false);
    }
  };

return (
  <>
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>

      <AppText style={{ color: colors.text, marginBottom: 6 }}>Tag name:</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
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
        onPress={save}
        style={{
          backgroundColor: colors.buttonActive,
          padding: 16,
          borderRadius: radius.md,
          alignItems: "center",
          marginBottom: editingId ? 12 : 0
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            {editingId ? "Save" : "Add tag"}
          </AppText>
        )}
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          onPress={deleteTag}
          style={{
            backgroundColor: colors.deleteButton,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
          }}
          disabled={loading}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete tag</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
    <FormErrorModal
      visible={!!errorMessage}
      message={errorMessage || ""}
      onClose={() => setErrorMessage(null)}
    />
  </>
);
};

