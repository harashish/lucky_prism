import React, { useEffect, useState } from "react";
import {
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";
import { colors, radius, spacing } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";
import { useChallengeStore } from "../../app/stores/useChallengeStore";

export type TagsFormScreenProps = {
  editingId?: number;
};

export default function TagsFormScreen({ editingId }: TagsFormScreenProps) {
  const router = useRouter();

  const {
    loadTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
  } = useChallengeStore();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---- load tag for edit
  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const tag = await getTagById(editingId);

      if (!tag) {
        setErrorMessage("Cannot load tag");
      } else {
        setName(tag.name);
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  // ---- save
  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter tag name");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateTag(editingId, { name: name.trim() });
      } else {
        await createTag({ name: name.trim() });
      }

      await loadTags();
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Cannot save tag"
      );
    }
    finally {
      setLoading(false);
    }
  };

  // ---- delete
  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteTag(editingId);
      await loadTags();
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Cannot delete tag"
      );
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <AppText style={{ color: colors.text, marginBottom: 6 }}>
          Tag name:
        </AppText>

        <TextInput
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: radius.md,
            padding: 10,
            marginBottom: spacing.m,
            color: colors.text,
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
            marginBottom: editingId ? spacing.s : 0,
          }}
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
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete tag?",
                message: "This tag will be permanently removed.",
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
              Delete tag
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
