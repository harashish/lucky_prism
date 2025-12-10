import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, FlatList, Alert } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useTodoStore } from "../stores/useTodoStore";
import { useRouter } from "expo-router";
import TodoItem from "../../components/TodoItem";
import BottomInputBar from "../../components/BottomInputBar";
import CustomDifficultyPicker from "../todos/customDifficultyPicker";
import EditTodoPopup from "../todos/editTodoPopup";
import { KeyboardAvoidingView, Platform } from "react-native";

const userId = 1;

export default function TodosScreen() {
  const router = useRouter();
  const { categories, tasks, loadCategories, loadTasks, quickAddTask, completeTask, deleteTask } = useTodoStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [quickText, setQuickText] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<number | null>(null);

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);

  // LOAD CATEGORIES + SELECT FIRST
  useEffect(() => {
    (async () => {
      await loadCategories();
    })();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  // LOAD TASKS WHEN CATEGORY CHANGES
  useEffect(() => {
    if (selectedCategoryId !== null) {
      loadTasks(userId, selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const onQuickAdd = async () => {
    if (!quickText.trim()) return;
    const catId = selectedCategoryId;
    if (!catId) return;

    const res = await quickAddTask(userId, catId, quickText.trim(), customDifficulty);
    if (res) {
      setQuickText("");
      setCustomDifficulty(null);
    } else {
      Alert.alert("Błąd", "Nie udało się dodać zadania");
    }
  };



return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
  >
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {showDifficulty && (
        <CustomDifficultyPicker
          onSelect={(id) => {
            setCustomDifficulty(id);
            setShowDifficulty(false);
          }}
          onClose={() => setShowDifficulty(false)}
        />
      )}

      {editingTodo && (
        <EditTodoPopup
          item={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSaved={async () => {
            setEditingTodo(null);
            await loadTasks(userId, selectedCategoryId!);
          }}
        />
      )}

      <FlatList
        data={tasks.filter(t => !t.is_completed)}
        keyExtractor={(item) => item.id.toString()}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TodoItem
            item={item}
            onLongPress={() => setEditingTodo(item)}
            onComplete={async () => {
              const res = await completeTask(item.id);
              if (res) Alert.alert("Zrobione", `+${res.xp_gained} XP`);
            }}
            onDelete={async () => {
              const ok = await deleteTask(item.id);
              if (!ok) Alert.alert("Błąd", "Nie udało się usunąć");
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <BottomInputBar
        quickText={quickText}
        setQuickText={setQuickText}
        onQuickAdd={onQuickAdd}
        onOpenDifficulty={() => setShowDifficulty(true)}
      />
    </View>
  </KeyboardAvoidingView>
);

}
