import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTodoStore } from "../app/stores/useTodoStore";
import { api } from "../app/api/apiClient";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";

export default function CategoryForm() {
  const { id } = useLocalSearchParams();
  const editing = !!id;
  const router = useRouter();
  const { addCategory, saveCategory, deleteCategory } = useTodoStore();

  const [name, setName] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const colorPalette = ["#908bab", "#E5FE86", "#825BA5", "#83CDEE", "#E4BEE6", "#EA97DC","#A0B4EF"];
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;



  useEffect(() => {
    (async () => {
      const res = await api.get("/common/difficulties/");
      setDifficulties(res.data);
    })();
  }, []);

  useEffect(() => {
    if (editing) {
      (async () => {
        try {
          const res = await api.get(`/todos/categories/${id}/`);
          setName(res.data.name);
          setDifficultyId(res.data.difficulty?.id || null);
          setColor(res.data.color || null);
        } catch (e) {
          Alert.alert("Error", "Failed to load category");
        }
      })();
    }
  }, [id]);

  const save = async () => {
    if (!name.trim()) return Alert.alert("Name", "Please enter a category name");
    if (!difficultyId) return Alert.alert("Difficulty", "Please select a difficulty level");

    const payload: any = {
      name: name.trim(),
      difficulty_id: difficultyId,
      color: color || null,
    };

    let ok;
    if (editing) ok = await saveCategory(Number(id), payload);
    else ok = await addCategory(payload);

    if (!ok) return Alert.alert("Error", "Failed to save category");
    router.push("/TodosScreen");
  };

const handleDelete = async () => {
  const confirm = await new Promise(resolve => {
    Alert.alert(
      "Delete category?",
      "This will delete all tasks in this category",
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Delete", style: "destructive", onPress: () => resolve(true) }
      ]
    );
  });

  if (!confirm) return;

const ok = await deleteCategory(Number(id));
if (!ok) return Alert.alert("Error", "Nie można usunąć ostatniej kategorii");

  router.push("/TodosScreen");
};


  return (
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

      <AppText style={{ marginBottom: 8 }}>Difficulty (XP per item)</AppText>
      <View style={{ marginBottom: 20 }}>
        {difficulties.map((d) => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setDifficultyId(d.id)}
            style={{
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              backgroundColor: difficultyId === d.id ? colors.buttonActive : colors.card,
            }}
          >
            <AppText style={{ color: difficultyId === d.id ? "#fff" : colors.text }}>
              {d.name}
                {gamificationOn ? ` (${d.xp_value} XP)` : ""}
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
              borderColor: "#fff"
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={save}
        style={{ padding: 14, borderRadius: 10, backgroundColor: colors.buttonActive, alignItems: "center", marginBottom: editing ? 12 : 0 }}
      >
        <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editing ? "Save" : "Add"}</AppText>
      </TouchableOpacity>

      {editing && (
        <TouchableOpacity
          onPress={handleDelete}
          style={{ padding: 14, borderRadius: 10, backgroundColor: "#d9534f", alignItems: "center" }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete Category</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
