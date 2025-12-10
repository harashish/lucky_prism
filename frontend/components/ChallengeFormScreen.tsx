// frontend/components/ChallengeFormScreen.tsx

import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useChallengeStore, Challenge, ChallengeType, DifficultyType } from "../app/stores/useChallengeStore";
import { colors, spacing, radius } from "../constants/theme";
import AppText from "../components/AppText";
import { api } from "../app/api/apiClient"; // import instancji Axios

const ChallengeFormScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tags, loadTags, loadChallenges } = useChallengeStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChallengeType | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyType | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ChallengeType[]>([]);
  const [availableDifficulties, setAvailableDifficulties] = useState<DifficultyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingChallengeId = params?.id ? parseInt(params.id as string, 10) : null;

  // load tags on mount
  useEffect(() => { loadTags(); }, []);

  // load challenge if editing
  useEffect(() => {
    if (editingChallengeId) {
      api.get(`/challenges/${editingChallengeId}/`)
        .then(res => {
          const c: Challenge = res.data;
          setTitle(c.title);
          setDescription(c.description);
          setType(c.type);
          setDifficulty(c.difficulty);
          setSelectedTags(c.tags.map(t => t.id));
        })
        .catch(err => console.error(err));
    }
  }, [editingChallengeId]);

  // fetch types and difficulties
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [typesRes, diffRes] = await Promise.all([
          api.get("/challenges/types/"),
          api.get("/common/difficulties/")
        ]);
        setAvailableTypes(typesRes.data);
        setAvailableDifficulties(diffRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const deleteChallenge = async () => {
    if (!editingChallengeId) return;
    setLoading(true);
    try {
      await api.delete(`/challenges/${editingChallengeId}/`);
      loadChallenges();
      router.push("/ChallengeListScreen");
    } catch {
      setError("Nie udało się usunąć challenge");
    } finally {
      setLoading(false);
    }
  };

  const saveChallenge = async () => {
    if (!title || !type || !difficulty || selectedTags.length === 0) {
      setError("Uzupełnij wszystkie pola");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        type_id: type.id,
        difficulty_id: difficulty.id,
        tags_ids: selectedTags
      };

      if (editingChallengeId) {
        await api.patch(`/challenges/${editingChallengeId}/`, payload);
      } else {
        await api.post("/challenges/", payload);
      }

      loadChallenges();
      router.push("/ChallengeListScreen");
    } catch {
      setError("Błąd zapisu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}>
      {error && <AppText style={{ color: "red", marginBottom: spacing.m }}>{error}</AppText>}

      <AppText style={{ fontSize: 22, fontWeight: "bold", marginBottom: spacing.m }}>
        {editingChallengeId ? "Edit challenge" : "Add challenge"}
      </AppText>

      {/* Nazwa */}
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

      {/* Opis */}
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

      {/* Typ */}
      <AppText style={{ marginBottom: 6 }}>Type:</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {availableTypes.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setType(t)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor: type?.id === t.id ? colors.buttonActive : colors.button
            }}
          >
            <AppText>{t.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trudność */}
      <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {availableDifficulties.map(d => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setDifficulty(d)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor: difficulty?.id === d.id ? colors.buttonActive : colors.button
            }}
          >
            <AppText>{d.name} ({d.xp_value} XP)</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tagi */}
      <AppText style={{ marginBottom: 6 }}>Tags:</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.l }}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => toggleTag(tag.id)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor: selectedTags.includes(tag.id)
                ? colors.buttonActive
                : colors.button
            }}
          >
            <AppText>{tag.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Zapisz */}
      <TouchableOpacity
        onPress={saveChallenge}
        style={{
          backgroundColor: colors.buttonActive,
          padding: spacing.m,
          borderRadius: radius.md,
          alignItems: "center",
          marginBottom: editingChallengeId ? spacing.m : 0
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editingChallengeId ? "Save" : "Add challenge"}</AppText>
        }
      </TouchableOpacity>

      {/* Usuń */}
      {editingChallengeId && (
        <TouchableOpacity
          onPress={deleteChallenge}
          style={{
            backgroundColor: colors.deleteButton,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: spacing.l
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>Delete challenge</AppText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default ChallengeFormScreen;

