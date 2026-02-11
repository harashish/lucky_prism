import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useTodoStore } from "../../app/stores/useTodoStore";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

export type CategoryFormScreenProps = {
  editingId?: number;
};

export default function CategoryFormScreen({ editingId }: CategoryFormScreenProps) {
  const router = useRouter();
  const isEdit = Boolean(editingId);

  const {
    createCategory,
    saveCategory,
    deleteCategory,
    getCategoryById,
    loadDifficulties,
  } = useTodoStore();

  const [name, setName] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const colorPalette = [
    "#908bab",
    "#E5FE86",
    "#825BA5",
    "#83CDEE",
    "#E4BEE6",
    "#EA97DC",
    "#A0B4EF",
  ];

  useEffect(() => {
    const loadMeta = async () => {
      const diffs = await loadDifficulties();
      setDifficulties(diffs);
    };
    loadMeta();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const c = await getCategoryById(editingId);

      if (!c) {
        setErrorMessage("Failed to load category");
      } else {
        setName(c.name);
        setDifficultyId(c.difficulty?.id || null);
        setColor(c.color || null);
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter category name");
      return;
    }
    if (!difficultyId) {
      setErrorMessage("Please select difficulty");
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      difficulty_id: difficultyId,
      color,
    };

    try {
      if (isEdit && editingId) {
        await saveCategory(editingId, payload);
      } else {
        await createCategory(payload);
      }
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to save category"
      );
    }
    finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteCategory(editingId);
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to delete category"
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
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholder="Category name"
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

        <AppText style={{ marginBottom: 6 }}>Color:</AppText>
        <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
          {colorPalette.map(c => (
            <TouchableOpacity
              key={c}
              disabled={loading}
              onPress={() => setColor(c)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: c,
                marginRight: 8,
                borderWidth: color === c ? 2 : 0,
                borderColor: "#fff",
              }}
            />
          ))}
        </View>

        <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
          {difficulties.map(d => (
            <TouchableOpacity
              key={d.id}
              disabled={loading}
              onPress={() => setDifficultyId(d.id)}
              style={{
                padding: spacing.s,
                borderRadius: radius.md,
                marginRight: spacing.s,
                marginBottom: spacing.s,
                backgroundColor:
                  difficultyId === d.id ? colors.buttonActive : colors.button,
              }}
            >
              <AppText>{d.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={save}
          style={{
            backgroundColor: colors.buttonActive,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: isEdit ? spacing.m : 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {isEdit ? "Save" : "Add category"}
            </AppText>
          )}
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete category?",
                message: "All tasks in this category will be deleted.",
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
              Delete category
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
