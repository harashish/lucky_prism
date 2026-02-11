import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import { useHabitStore } from "../../app/stores/useHabitStore";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

type HabitFormScreenProps = {
  editingId?: number;
};

export default function HabitFormScreen({ editingId }: HabitFormScreenProps) {
  const router = useRouter();
  const { createHabit, updateHabit, deleteHabit, loadDifficulties, difficulties, getHabitById } = useHabitStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
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

  const [color, setColor] = useState<string>(colorPalette[0]);


  useEffect(() => {
    loadDifficulties();

    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const h = await getHabitById(editingId);
      if (!h) {
        setErrorMessage("Failed to load habit");
      } else {
        setTitle(h.title);
        setDescription(h.description || "");
        setWhy(h.motivation_reason || "");
        setColor(h.color || colorPalette[0]);
        setDifficultyId(h.difficulty?.id || null);
      }
      setLoading(false);
    };

    load();
  }, [editingId]);

  const save = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter habit name");
      return;
    }
    if (!difficultyId) {
      setErrorMessage("Please select difficulty");
      return;
    }
    if (!why.trim()) {
      setErrorMessage("Please enter Why it's important");
      return;
    }

    setLoading(true);
    const payload = {
      title,
      description,
      motivation_reason: why,
      color,
      difficulty_id: difficultyId,
    };
    try {
      if (editingId) {
        await updateHabit(editingId, payload);
      } else {
        await createHabit(payload);
      }
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to save habit"
      );
    }
    finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!editingId) return;
    setLoading(true);
    try {
      await deleteHabit(editingId);
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to delete habit"
       );
    }
    finally {
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
            borderColor: 
            colors.inputBorder, 
            color: colors.text, 
            padding: spacing.s, 
            borderRadius: radius.md, 
            marginBottom: spacing.m 
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
          multiline style={{ 
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
            <AppText>
              {d.name}
            </AppText>

          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={save} disabled={loading} style={{ backgroundColor: colors.buttonActive, padding: spacing.m, borderRadius: radius.md, alignItems: "center", marginBottom: editingId ? spacing.m : 0 }}>
        {loading ? <ActivityIndicator color="#fff" /> : <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editingId ? "Save" : "Add habit"}</AppText>}
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          disabled={loading}
          onPress={() =>
            confirmDelete({
              title: "Delete habit?",
              message: "This habit will be permanently removed.",
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
            Delete habit
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
