import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTodoStore } from "../app/stores/useTodoStore";
import { api } from "../app/api/apiClient";
import FormErrorModal from "../components/FormErrorModal";
import { confirmDelete } from "../components/confirmDelete";

export default function CategoryForm() {
  const { id } = useLocalSearchParams();
  const editing = !!id;
  const router = useRouter();
  const { addCategory, saveCategory, deleteCategory } = useTodoStore();

  const [name, setName] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);
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
    api.get("/common/difficulties/").then(res => setDifficulties(res.data));
  }, []);

  useEffect(() => {
    if (!editing) return;
    api.get(`/todos/categories/${id}`)
      .then(res => {
        setName(res.data.name);
        setDifficultyId(res.data.difficulty?.id || null);
        setColor(res.data.color || null);
      })
      .catch(() => setErrorMessage("Failed to load category"));
  }, [editing, id]);

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter category name");
      return;
    }
    if (!difficultyId) {
      setErrorMessage("Please select difficulty");
      return;
    }

    const payload = {
      name: name.trim(),
      difficulty_id: difficultyId,
      color,
    };

    const ok = editing
      ? await saveCategory(Number(id), payload)
      : await addCategory(payload);

    if (!ok) {
      setErrorMessage("Failed to save category");
      return;
    }

    router.push("/TodosScreen");
  };

  const deleteCategoryHandler = async () => {
    const ok = await deleteCategory(Number(id));
    if (!ok) {
      setErrorMessage("Cannot delete last category");
      return;
    }
    router.push("/TodosScreen");
  };

  return (
    <>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <AppText style={{ marginBottom: 8 }}>Category Name</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#7a7891"
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: colors.card,
            color: colors.text,
            marginBottom: 20,
          }}
        />

        <AppText style={{ marginBottom: 8 }}>Difficulty</AppText>
        <View style={{ marginBottom: 20 }}>
          {difficulties.map(d => (
            <TouchableOpacity
              key={d.id}
              onPress={() => setDifficultyId(d.id)}
              style={{
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                backgroundColor:
                  difficultyId === d.id ? colors.buttonActive : colors.card,
              }}
            >
              <AppText
                style={{ color: difficultyId === d.id ? "#fff" : colors.text }}
              >
                {d.name}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={{ marginBottom: 8 }}>Color (optional)</AppText>
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
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

        <TouchableOpacity
          onPress={save}
          style={{
            padding: 14,
            borderRadius: 10,
            backgroundColor: colors.buttonActive,
            alignItems: "center",
            marginBottom: editing ? 12 : 0,
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            {editing ? "Save" : "Add"}
          </AppText>
        </TouchableOpacity>

        {editing && (
          <TouchableOpacity
            onPress={() =>
              confirmDelete({
                title: "Delete category?",
                message: "All tasks in this category will be deleted.",
                onConfirm: deleteCategoryHandler,
              })
            }
            style={{
              padding: 14,
              borderRadius: 10,
              backgroundColor: colors.deleteButton,
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
