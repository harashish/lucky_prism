import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSobrietyStore } from "../../app/stores/useSobrietyStore";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

type Props = {
  editingId?: number;
};

export default function SobrietyFormScreen({ editingId }: Props) {
  const router = useRouter();

  const {
    getSobrietyById,
    createSobriety,
    updateSobriety,
    deleteSobriety,
  } = useSobrietyStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const s = await getSobrietyById(editingId);

      if (!s) {
        setErrorMessage("Failed to load sobriety");
      } else {
        setName(s.name);
        setDescription(s.description || "");
        setWhy(s.motivation_reason);
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter name");
      return;
    }

    if (!why.trim()) {
      setErrorMessage("Please enter motivation");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      description,
      motivation_reason: why,
    };

    try {
      if (editingId) {
        await updateSobriety(editingId, payload);
      } else {
        await createSobriety(payload);
      }

      router.back();
    } catch {
      setErrorMessage("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    await deleteSobriety(editingId);
    router.back();
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Description (optional):</AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
            minHeight: 80,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Why is this important?</AppText>
        <TextInput
          value={why}
          onChangeText={setWhy}
          multiline
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
            minHeight: 90,
          }}
        />

        <TouchableOpacity
          onPress={save}
          disabled={loading}
          style={{
            backgroundColor: colors.buttonActive,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: editingId ? spacing.m : 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {editingId ? "Save" : "Start"}
            </AppText>
          )}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete sobriety?",
                message: "This will remove the tracker permanently.",
                onConfirm: deleteHandler,
              })
            }
            style={{
              backgroundColor: colors.deleteButton,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              Delete
            </AppText>
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
}