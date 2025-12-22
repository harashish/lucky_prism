import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AppText from "./AppText";
import { colors, spacing, radius } from "../constants/theme";
import { useRouter } from "expo-router";
import { useTodoStore } from "../app/stores/useTodoStore";
import { api } from "../app/api/apiClient";
import FormErrorModal from "../components/FormErrorModal";
import { confirmDelete } from "../components/confirmDelete";

export type CategoryFormScreenProps = {
  editingId?: number;
};

export default function CategoryFormScreen({ editingId }: CategoryFormScreenProps) {
  const isEdit = typeof editingId === "number";

  const router = useRouter();
  const { addCategory, saveCategory, deleteCategory } = useTodoStore();

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

  // ---- load difficulties
  useEffect(() => {
    api
      .get("/common/difficulties/")
      .then(res => setDifficulties(res.data))
      .catch(() => setErrorMessage("Failed to load difficulties"));
  }, []);

  // ---- load category for edit
  useEffect(() => {
    if (!editingId) return;

    setLoading(true);
    api
      .get(`/todos/categories/${editingId}`)
      .then(res => {
        setName(res.data.name);
        setDifficultyId(res.data.difficulty?.id || null);
        setColor(res.data.color || null);
      })
      .catch(() => setErrorMessage("Failed to load category"))
      .finally(() => setLoading(false));
  }, [editingId]);

  // ---- save
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
        await addCategory(payload);
      }
      router.push("/TodosScreen");
    } catch {
      setErrorMessage("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // ---- delete
  const onDelete = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteCategory(editingId);
      router.push("/TodosScreen");
    } catch {
      setErrorMessage("Cannot delete last category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* NAME */}
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
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

        {/* COLOR */}
        <AppText style={{ marginBottom: 6 }}>Color:</AppText>
        <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
          {colorPalette.map(c => (
            <TouchableOpacity
              key={c}
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

        {/* DIFFICULTY */}
        <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
          {difficulties.map(d => (
            <TouchableOpacity
              key={d.id}
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

        {/* SAVE */}
        <TouchableOpacity
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

        {/* DELETE */}
        {isEdit && (
          <TouchableOpacity
            onPress={() =>
              confirmDelete({
                title: "Delete category?",
                message: "All tasks in this category will be deleted.",
                onConfirm: onDelete,
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
