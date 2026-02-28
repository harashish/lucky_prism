import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useTodoStore } from "../../app/stores/useTodoStore";


export default function TodoTaskFormScreen({ editingId }: { editingId?: number }) {
  const router = useRouter();
  

  const {
    tasks,
    updateTask,
    deleteTask,
    loadDifficulties,
    categories,
    loadCategories
  } = useTodoStore();

  const task = tasks.find(t => t.id === editingId);

  const [content, setContent] = useState("");
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setDifficultyId(task.custom_difficulty?.id || null);
      setCategoryId(task.category?.id || null);
    }
  }, [task]);

  useEffect(() => {
    const load = async () => {
      const diffs = await loadDifficulties();
      setDifficulties(diffs);
    };
    load();
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const save = async () => {
    if (!content.trim() || !editingId) return;

    setLoading(true);
    try {
      await updateTask(editingId, {
        content: content.trim(),
        custom_difficulty_id: difficultyId,
        category_id: categoryId,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteTask(editingId);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: spacing.m,
        backgroundColor: colors.background,
      }}
    >
      <AppText style={{ marginBottom: 6 }}>Task:</AppText>

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Task content"
        placeholderTextColor="#7a7891"
        multiline
        textAlignVertical="top"
        style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.m,
            borderRadius: radius.md,
            marginBottom: spacing.m,

            minHeight: 140,   // ← wysokość form
        }}
        />

      <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {difficulties.map(d => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setDifficultyId(d.id)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor:
                difficultyId === d.id ? colors.buttonActive : colors.button,
            }}
          >
            <AppText>{d.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ marginBottom: 6 }}>Category:</AppText>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
        {categories.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setCategoryId(c.id)}
            style={{
              padding: spacing.s,
              borderRadius: radius.md,
              marginRight: spacing.s,
              marginBottom: spacing.s,
              backgroundColor:
                categoryId === c.id ? colors.buttonActive : colors.button,
            }}
          >
            <AppText>{c.name}</AppText>
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
          marginBottom: spacing.m,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            Save
          </AppText>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={deleteHandler}
        disabled={loading}
        style={{
          backgroundColor: colors.deleteButton,
          padding: spacing.m,
          borderRadius: radius.md,
          alignItems: "center",
        }}
      >
        <AppText style={{ color: "#fff" }}>Delete task</AppText>
      </TouchableOpacity>
    </ScrollView>
  );
}