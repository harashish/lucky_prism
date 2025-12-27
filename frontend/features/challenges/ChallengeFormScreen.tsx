import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useChallengeStore, ChallengeType, DifficultyType } from "../../app/stores/useChallengeStore";
import { colors, spacing, radius } from "../../constants/theme";
import AppText from "../../components/AppText";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

export type ChallengeFormScreenProps = {
  editingId?: number;
};

export default function ChallengeFormScreen({ editingId }: ChallengeFormScreenProps) {
  const router = useRouter();

  const {
    tags,
    difficulties,
    loadTags,
    loadDifficulties,
    loadChallenges,

    getChallengeById,
    loadTypes,
    createChallenge,
    updateChallenge,
    deleteChallenge,
  } = useChallengeStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChallengeType | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyType | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [availableTypes, setAvailableTypes] = useState<ChallengeType[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---- init
  useEffect(() => {
    loadTags();
    loadDifficulties();

    const loadMeta = async () => {
      const types = await loadTypes();
      setAvailableTypes(types);
    };

    loadMeta();
  }, []);

  // ---- load challenge for edit
  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const c = await getChallengeById(editingId);

      if (!c) {
        setErrorMessage("Failed to load challenge");
      } else {
        setTitle(c.title);
        setDescription(c.description);
        setType(c.type);
        setDifficulty(c.difficulty);
        setSelectedTags(c.tags.map(t => t.id));
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // ---- save
  const save = async () => {
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

    const payload = {
      title,
      description,
      type_id: type.id,
      difficulty_id: difficulty.id,
      tags_ids: selectedTags,
    };

    try {
      if (editingId) {
        await updateChallenge(editingId, payload);
      } else {
        await createChallenge(payload);
      }

      await loadChallenges();
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to save challenge"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- delete
  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteChallenge(editingId);
      await loadChallenges();
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to delete challenge"
      );
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
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={title}
          onChangeText={setTitle}
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

        <AppText style={{ marginBottom: 6 }}>Description:</AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
            minHeight: 90,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Type:</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
          {availableTypes.map(t => (
            <TouchableOpacity
              key={t.id}
              disabled={loading}
              onPress={() => setType(t)}
              style={{
                padding: spacing.s,
                borderRadius: radius.md,
                marginRight: spacing.s,
                marginBottom: spacing.s,
                backgroundColor:
                  type?.id === t.id ? colors.buttonActive : colors.button,
              }}
            >
              <AppText>{t.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
          {difficulties.map(d => (
            <TouchableOpacity
              key={d.id}
              disabled={loading}
              onPress={() => setDifficulty(d)}
              style={{
                padding: spacing.s,
                borderRadius: radius.md,
                marginRight: spacing.s,
                marginBottom: spacing.s,
                backgroundColor:
                  difficulty?.id === d.id ? colors.buttonActive : colors.button,
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
              disabled={loading}
              onPress={() => toggleTag(tag.id)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: radius.md,
                marginRight: spacing.s,
                marginBottom: spacing.s,
                backgroundColor: selectedTags.includes(tag.id)
                  ? colors.buttonActive
                  : colors.button,
              }}
            >
              <AppText>{tag.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={save}
          disabled={loading}
          style={{
            backgroundColor: colors.buttonActive,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: editingId ? spacing.m : 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {editingId ? "Save" : "Add challenge"}
            </AppText>
          )}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete challenge?",
                message: "This challenge will be permanently removed.",
                onConfirm: deleteHandler,
              })
            }
            style={{
              backgroundColor: colors.deleteButton,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
              marginBottom: spacing.l,
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
}
