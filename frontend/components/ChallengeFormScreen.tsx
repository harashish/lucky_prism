import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useChallengeStore, Challenge, ChallengeType, DifficultyType } from "../app/stores/useChallengeStore";
import { colors, spacing, radius } from "../constants/theme";
import AppText from "../components/AppText";
import { api } from "../app/api/apiClient";
import FormErrorModal from "../components/FormErrorModal";
import { confirmDelete } from "../components/confirmDelete";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editingId = params?.id ? parseInt(params.id as string, 10) : null;

  useEffect(() => { loadTags(); }, []);

  useEffect(() => {
    if (editingId) {
      api.get(`/challenges/${editingId}/`)
        .then(res => {
          const c: Challenge = res.data;
          setTitle(c.title);
          setDescription(c.description);
          setType(c.type);
          setDifficulty(c.difficulty);
          setSelectedTags(c.tags.map(t => t.id));
        })
          .catch(err => {
            console.error(err);
            setErrorMessage("Failed to load challenge");
          })
          .finally(() => setLoading(false));
    }
  }, [editingId]);

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
    if (!editingId) return;
    setLoading(true);
    try {
      await api.delete(`/challenges/${editingId}/`);
      loadChallenges();
      router.push("/ChallengesListScreen");
    } catch {
      setErrorMessage("Failed to delete challenge");
    } finally {
      setLoading(false);
    }
  };

  const saveChallenge = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter challenge name");
      return;
    }
    if (!type) {
      setErrorMessage("Please select challenge type");
      return;
    }
    if (!difficulty) {
      setErrorMessage("Please select difficulty");
      return;
    }
    if (selectedTags.length === 0) {
      setErrorMessage("Please select at least one tag");
      return;
    }


    setLoading(true);

    try {
      const payload = {
        title,
        description,
        type_id: type.id,
        difficulty_id: difficulty.id,
        tags_ids: selectedTags
      };

      if (editingId) {
        await api.patch(`/challenges/${editingId}/`, payload);
      } else {
        await api.post("/challenges/", payload);
      }

      loadChallenges();
      router.push("/ChallengesListScreen");
    } catch {
      setErrorMessage("Failed to save challenge");
    } finally {
      setLoading(false);
    }
  };

return (
  <>
    <ScrollView style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }} contentContainerStyle={{
    paddingBottom: 30
  }}>

      <AppText style={{ fontSize: 22, fontWeight: "bold", marginBottom: spacing.m }}>
        {editingId ? "Edit challenge" : "Add challenge"}
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
            <AppText>{d.name}</AppText>

          </TouchableOpacity>
        ))}
      </View>

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

      <TouchableOpacity
        onPress={saveChallenge}
        style={{
          backgroundColor: colors.buttonActive,
          padding: spacing.m,
          borderRadius: radius.md,
          alignItems: "center",
          marginBottom: editingId ? spacing.m : 0
        }}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <AppText style={{ color: "#fff", fontWeight: "bold" }}>{editingId ? "Save" : "Add challenge"}</AppText>
        }
      </TouchableOpacity>

      {editingId && (
        <TouchableOpacity
          onPress={() =>
            confirmDelete({
              title: "Delete challenge?",
              message: "This challenge will be permanently removed.",
              onConfirm: deleteChallenge,
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
            Delete challenge
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

export default ChallengeFormScreen;

