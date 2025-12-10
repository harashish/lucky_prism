// frontend/components/GoalFormScreen.tsx

import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoalStore } from "../app/stores/useGoalStore";
import { api } from "../app/api/apiClient";
import AppText from "../components/AppText";
import { colors, spacing, radius } from "../constants/theme";

const GoalFormScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editingId = params?.id ? parseInt(params.id as string, 10) : null;
  const { periods, loadPeriods, loadGoals } = useGoalStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [period, setPeriod] = useState<number | null>(null);
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [availableDifficulties, setAvailableDifficulties] = useState<any[]>([]);
  const [selectedPeriodObj, setSelectedPeriodObj] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = 1;

  useEffect(() => {
    loadPeriods();
    fetchDifficulties();
  }, []);

  useEffect(() => {
    if (editingId) {
      setLoading(true);
      api.get(`/goals/${editingId}/`)
        .then(res => {
          const g = res.data;
          setTitle(g.title);
          setDescription(g.description);
          setWhy(g.motivation_reason || "");
          setPeriod(g.period?.id || null);
          setSelectedPeriodObj(g.period || null);
          setDifficultyId(g.difficulty?.id || null);
        })
        .catch(err => {
          console.error(err);
          setError("Nie udało się pobrać celu");
        })
        .finally(() => setLoading(false));
    }
  }, [editingId]);

  useEffect(() => {
    if (period) {
      const p = periods.find((x: any) => x.id === period);
      setSelectedPeriodObj(p || null);
    } else {
      setSelectedPeriodObj(null);
    }
  }, [period, periods]);

  const fetchDifficulties = async () => {
    try {
      const res = await api.get("/challenges/difficulties/"); // re-use difficulties endpoint
      setAvailableDifficulties(res.data);
    } catch (e) {
      console.error(e);
    }
  };

// ... (Wewnątrz GoalFormScreen)

  const computedXp = () => {
    // 1. Pobieramy wartość bazową XP dla wybranego okresu (np. 50, 200, 1000)
    const periodBase = selectedPeriodObj?.default_xp || 0;
    
    // 2. Pobieramy procentową wartość trudności (np. 10, 20, 50)
    const difficultyValue = availableDifficulties.find(d => d.id === difficultyId)?.xp_value || 0;
    
    // 3. Konwertujemy wartość trudności na ułamek (np. 50 -> 0.5)
    // Zgodnie z Twoją logiką z GoalsScreen.tsx: (g.difficulty?.xp_value || 0) / 100
    const diffPercent = difficultyValue / 100;
    
    // 4. Mnożymy bazowe XP przez procent trudności i zaokrąglamy
    // Zgodnie z Twoją logiką z GoalsScreen.tsx: Math.round(periodBase * diffPercent)
    return Math.round(periodBase * diffPercent);
  };

  const save = async () => {
// ... (reszta funkcji save)
    if (!title || !period || !difficultyId) {
      setError("Uzupełnij wszystkie wymagane pola");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      title,
      description,
      motivation_reason: why,
      period_id: period,
      difficulty_id: difficultyId,
      user_id: userId,
    };

    try {
      if (editingId) {
        await api.patch(`/goals/${editingId}/`, payload);
      } else {
        await api.post("/goals/", payload);
      }
      await loadGoals();
      router.push("/GoalsScreen");
    } catch (err) {
      console.error(err);
      setError("Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await api.delete(`/goals/${editingId}/`);
      await loadGoals();
      router.push("/GoalsScreen");
    } catch {
      setError("Nie udało się usunąć celu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}>
      {error && <AppText style={{ color: "red", marginBottom: spacing.m }}>{error}</AppText>}

      <AppText style={{ fontSize: 22, fontWeight: "bold", marginBottom: spacing.m }}>
        {editingId ? "Edit goal" : "Add goal"}
      </AppText>

      <AppText style={{ marginBottom: 6 }}>Name:</AppText>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          color: colors.text,
          padding: spacing.s,
          borderRadius: radius.md,
          marginBottom: spacing.m,
        }}
        placeholderTextColor="#7a7891"
      />

      <AppText style={{ marginBottom: 6 }}>Description:</AppText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          color: colors.text,
          padding: spacing.s,
          borderRadius: radius.md,
          marginBottom: spacing.m,
          minHeight: 90
        }}
        placeholderTextColor="#7a7891"
      />

      <AppText style={{ marginBottom: 6 }}>Why it's important:</AppText>
      <TextInput
        value={why}
        onChangeText={setWhy}
        multiline
        style={{
          borderWidth: 1,
          borderColor: colors.inputBorder,
          color: colors.text,
          padding: spacing.s,
          borderRadius: radius.md,
          marginBottom: spacing.m,
          minHeight: 80
        }}
        placeholderTextColor="#7a7891"
      />

      <AppText style={{ marginBottom: 6 }}>Period:</AppText>
      <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
        {periods.map((p: any) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPeriod(p.id)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              backgroundColor: period === p.id ? colors.buttonActive : colors.button
            }}
          >
            <AppText>{p.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {availableDifficulties.map(d => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setDifficultyId(d.id)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor: difficultyId === d.id ? colors.buttonActive : colors.button
            }}
          >
            <AppText>{d.name} ({d.xp_value} XP)</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ marginBottom: spacing.m }}>XP gain: {computedXp()} XP</AppText>

      <TouchableOpacity
        onPress={save}
        style={{
          backgroundColor: colors.buttonActive,
          padding: spacing.m,
          borderRadius: radius.md,
          alignItems: "center",
          marginBottom: editingId ? spacing.m : 0
        }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editingId ? "Save" : "Add goal"}</AppText>}
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          onPress={deleteGoal}
          style={{
            backgroundColor: colors.deleteButton,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: spacing.l
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete goal</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default GoalFormScreen;
