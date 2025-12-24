import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useGoalStore } from "../../app/stores/useGoalStore";
import { api } from "../../app/api/apiClient";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

export type GoalFormScreenProps = {
  editingId?: number;
};

export default function GoalFormScreen({ editingId }: GoalFormScreenProps) {
  const router = useRouter();
  const { periods, loadPeriods } = useGoalStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [period, setPeriod] = useState<number | null>(null);
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [availableDifficulties, setAvailableDifficulties] = useState<any[]>([]);
  const [selectedPeriodObj, setSelectedPeriodObj] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          setErrorMessage("Failed to load goal");
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
      const res = await api.get("/common/difficulties/");
      setAvailableDifficulties(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const save = async () => {
if (!title.trim()) {
  setErrorMessage("Please enter goal name");
  return;
}
if (!difficultyId) {
  setErrorMessage("Please select difficulty");
  return;
}
if (!why.trim()) {
  setErrorMessage("Please fill: Why it's important");
  return;
}
    setLoading(true);
    const payload = {
      title,
      description,
      motivation_reason: why,
      period_id: period,
      difficulty_id: difficultyId,
    };

    try {
      if (editingId) {
        await api.patch(`/goals/${editingId}/`, payload);
      } else {
        await api.post("/goals/", payload);
      }
      router.back();

    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await api.delete(`/goals/${editingId}/`);
      router.back();

    } catch {
      setErrorMessage("Failed to delete goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }} contentContainerStyle={{
    paddingBottom: 30
  }}>



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
            <AppText>{d.name}</AppText>

          </TouchableOpacity>
        ))}
      </View>
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
          onPress={() =>
            confirmDelete({
              title: "Delete goal?",
              message: "This goal will be permanently removed.",
              onConfirm: deleteGoal,
            })
          }
          style={{
            backgroundColor: colors.deleteButton,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: spacing.l
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            Delete goal
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
};

