import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";
import { colors, radius, spacing } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";
import { useNotesStore } from "../../app/stores/useNotesStore";

export type NoteFormScreenProps = {
  editingId?: number;
};

export default function NoteFormScreen({ editingId }: NoteFormScreenProps) {
  const router = useRouter();

  const {
    fetchById,
    createNote,
    updateNote,
    deleteNote,
  } = useNotesStore();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---- load note for edit
  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const note = await fetchById(editingId);
      if (!note) {
        setErrorMessage("Cannot load note");
      } else {
        setContent(note.content);
      }
      setLoading(false);
    };

    load();
  }, [editingId, fetchById]);

  // ---- save
  const save = async () => {
    if (!content.trim()) {
      setErrorMessage("Note cannot be empty");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateNote(editingId, content);
      } else {
        await createNote(content);
      }
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to save note"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- delete
  const deleteNoteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteNote(editingId);
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to delete note"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          padding: spacing.m,
          backgroundColor: colors.background,
        }}
      >
        <AppText style={{ fontWeight: "700", marginBottom: spacing.s }}>
          {editingId ? "Edit note" : "New note"}
        </AppText>

        <TextInput
          value={content}
          onChangeText={setContent}
          multiline
          placeholder="Note content..."
          placeholderTextColor="#7a7891"
          selectionColor={colors.buttonActive}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            padding: spacing.m,
            borderRadius: radius.md,
            textAlignVertical: "top",
            color: colors.text,
          }}
        />

        <TouchableOpacity
          onPress={save}
          style={{
            backgroundColor: colors.buttonActive,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginTop: spacing.m,
            marginBottom: editingId ? spacing.s : 0,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {editingId ? "Save" : "Add note"}
            </AppText>
          )}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            onPress={() =>
              confirmDelete({
                title: "Delete note?",
                message: "This action cannot be undone.",
                onConfirm: deleteNoteHandler,
              })
            }
            style={{
              backgroundColor: colors.deleteButton,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
            }}
            disabled={loading}
          >
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              Delete note
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <FormErrorModal
        visible={!!errorMessage}
        message={errorMessage || ""}
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}
