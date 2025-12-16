// frontend/components/GoalFormScreen.tsx

import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AppText from "../components/AppText";
import { colors, spacing, radius } from "../constants/theme";
import { useHabitStore } from "../app/stores/useHabitStore";
import { api } from "../app/api/apiClient";

//const colorPalette = ["#c4a7e7", "#908bab", "#39a0a1", "#e07a5f", "#f2cc8f", "#a7c66b", "#ff6b6b"];
  const colorPalette = ["#908bab", "#E5FE86", "#825BA5", "#83CDEE", "#E4BEE6", "#EA97DC","#A0B4EF"];

export default function HabitFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params?.id ? parseInt(params.id as string, 10) : null;

  const { createHabit, updateHabit, deleteHabit, loadDifficulties, difficulties } = useHabitStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [color, setColor] = useState<string>(colorPalette[0]);
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = 1;

  useEffect(() => {
    loadDifficulties();
    if (editingId) {
      setLoading(true);
      api.get(`/habits/${editingId}/`)
        .then(res => {
          const h = res.data;
          setTitle(h.title);
          setDescription(h.description || "");
          setWhy(h.motivation_reason || "");
          setColor(h.color || colorPalette[0]);
          setDifficultyId(h.difficulty?.id || null);
        })
        .catch(err => {
          console.error(err);
          setError("Nie udało się pobrać habitu");
        })
        .finally(() => setLoading(false));
    }
  }, [editingId]);

  const computedXp = () => {
    const diff = difficulties.find(d => d.id === difficultyId)?.xp_value || 0;
    return diff;
  };

  const save = async () => {
    if (!title || !difficultyId) {
      setError("Uzupełnij wszystkie wymagane pola");
      return;
    }
    setLoading(true);
    const payload = {
      title,
      description,
      motivation_reason: why,
      color,
      difficulty_id: difficultyId,
      user_id: userId,
    };
    try {
      if (editingId) {
        await updateHabit(editingId, payload);
      } else {
        await createHabit(payload);
      }
      router.push("/HabitsScreen");
    } catch (err) {
      console.error(err);
      setError("Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await deleteHabit(editingId);
      router.push("/HabitsScreen");
    } catch {
      setError("Nie udało się usunąć habitu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}>
      {error && <AppText style={{ color: "red", marginBottom: spacing.m }}>{error}</AppText>}

      <AppText style={{ fontSize: 22, fontWeight: "bold", marginBottom: spacing.m }}>
        {editingId ? "Edit habit" : "Add habit"}
      </AppText>

      <AppText style={{ marginBottom: 6 }}>Name:</AppText>
      <TextInput value={title} onChangeText={setTitle} style={{ borderWidth: 1, borderColor: colors.inputBorder, color: colors.text, padding: spacing.s, borderRadius: radius.md, marginBottom: spacing.m }} placeholderTextColor="#7a7891" />

      <AppText style={{ marginBottom: 6 }}>Description:</AppText>
      <TextInput value={description} onChangeText={setDescription} multiline style={{ borderWidth: 1, borderColor: colors.inputBorder, color: colors.text, padding: spacing.s, borderRadius: radius.md, marginBottom: spacing.m, minHeight: 80 }} placeholderTextColor="#7a7891" />

      <AppText style={{ marginBottom: 6 }}>Why it's important:</AppText>
      <TextInput value={why} onChangeText={setWhy} multiline style={{ borderWidth: 1, borderColor: colors.inputBorder, color: colors.text, padding: spacing.s, borderRadius: radius.md, marginBottom: spacing.m, minHeight: 80 }} placeholderTextColor="#7a7891" />

      <AppText style={{ marginBottom: 6 }}>Color:</AppText>
      <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
        {colorPalette.map(c => (
          <TouchableOpacity key={c} onPress={() => setColor(c)} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: c, marginRight: 8, borderWidth: color === c ? 2 : 0, borderColor: "#fff" }} />
        ))}
      </View>

      <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {difficulties.map(d => (
          <TouchableOpacity key={d.id} onPress={() => setDifficultyId(d.id)} style={{ padding: spacing.s, borderRadius: radius.md, marginRight: spacing.s, marginBottom: spacing.s, backgroundColor: difficultyId === d.id ? colors.buttonActive : colors.button }}>
            <AppText>{d.name} ({d.xp_value} XP)</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ marginBottom: spacing.m }}>XP gain (per completion): {computedXp()} XP</AppText>

      <TouchableOpacity onPress={save} style={{ backgroundColor: colors.buttonActive, padding: spacing.m, borderRadius: radius.md, alignItems: "center", marginBottom: editingId ? spacing.m : 0 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editingId ? "Save" : "Add habit"}</AppText>}
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity onPress={onDelete} style={{ backgroundColor: colors.deleteButton, padding: spacing.m, borderRadius: radius.md, alignItems: "center" }}>
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete habit</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
