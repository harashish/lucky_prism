import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Alert } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTodoStore } from "../app/stores/useTodoStore";
import { api } from "../app/api/apiClient";

export default function CategoryForm() {
  const { id } = useLocalSearchParams();
  const editing = !!id;
  const router = useRouter();
  const { addCategory, saveCategory } = useTodoStore();

  const [name, setName] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [color, setColor] = useState<string | null>(null);

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
          Alert.alert("Błąd", "Nie udało się załadować kategorii");
        }
      })();
    }
  }, [id]);

  const save = async () => {
    if (!name.trim()) return Alert.alert("Nazwa", "Wpisz nazwę kategorii");
    if (!difficultyId) return Alert.alert("Trudność", "Wybierz poziom trudności");

    const payload: any = {
      name: name.trim(),
      difficulty_id: difficultyId,
      color: color || null,
    };

    let ok;
    if (editing) ok = await saveCategory(Number(id), payload);
    else ok = await addCategory(payload);

    if (!ok) return Alert.alert("Błąd", "Nie udało się zapisać kategorii");
    router.replace("/TodosScreen");
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <AppText style={{ marginBottom: 8 }}>Nazwa kategorii</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nazwa"
        placeholderTextColor="#7a7891"
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: colors.card,
          color: colors.text,
          marginBottom: 20,
        }}
      />

      <AppText style={{ marginBottom: 8 }}>Trudność (XP per item)</AppText>
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
              {d.name} ({d.xp_value} XP)
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ marginBottom: 8 }}>Kolor (opcjonalnie)</AppText>
      <TextInput
        value={color || ""}
        onChangeText={setColor}
        placeholder="#RRGGBB"
        placeholderTextColor="#7a7891"
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: colors.card,
          color: colors.text,
          marginBottom: 30,
        }}
      />

      <TouchableOpacity
        onPress={save}
        style={{ padding: 14, borderRadius: 10, backgroundColor: colors.buttonActive, alignItems: "center" }}
      >
        <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editing ? "Zapisz" : "Dodaj"}</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
}
