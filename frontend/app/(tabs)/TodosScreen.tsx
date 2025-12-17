// frontend/app/(tabs)/TodosScreen.tsx

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

  const [showCompleted, setShowCompleted] = useState(false);
  

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

const res = await quickAddTask(
  userId,
  catId,
  quickText.trim(),
  customDifficulty // już jest ID albo null
);

  if (res) {
    setQuickText("");
    setCustomDifficulty(null);
  } else {
    Alert.alert("Błąd", "Nie udało się dodać zadania");
  }
};


  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      
      {/* Difficulty Popup */}
      {showDifficulty && (
<CustomDifficultyPicker
  onSelect={(d: any) => { setCustomDifficulty(d.id); setShowDifficulty(false); }}
  onClose={() => setShowDifficulty(false)}
/>

      )}

      {/* Edit Todo Popup */}
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


      {/* CATEGORIES */}
      <View style={{ flexDirection: "row", marginBottom: 12, padding: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              onLongPress={() => router.push(`/editCategory/${cat.id}`)}
              style={{
                padding: 12,
                marginRight: 8,
                borderRadius: 10,
                backgroundColor: selectedCategoryId === cat.id ? colors.buttonActive : cat.color || colors.card,
                minWidth: 80,
                alignItems: "center",
              }}
            >
              <AppText>{cat.name}</AppText>
              <AppText style={{ fontSize: 12 }}>{cat.difficulty?.xp_value ?? 0} XP</AppText>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.push("/addCategory")}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.buttonActive,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>

            <TouchableOpacity onPress={() => setShowCompleted(prev => !prev)} style={{ padding: 8, marginBottom: 12, backgroundColor: colors.buttonActive, borderRadius: 10, alignItems: 'center' }}>
  <AppText style={{ color: "#fff" }}>{showCompleted ? "Show todo" : "Show completed"}</AppText>
</TouchableOpacity>

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
>
  {tasks.filter(t => showCompleted ? t.is_completed : !t.is_completed).length === 0 ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppText style={{ color: "#777", fontSize: 16 }}>
        {showCompleted
          ? "no completed tasks yet"
          : "no tasks yet, add some!"}
      </AppText>
    </View>
  ) : (
    <FlatList
      data={tasks.filter(t => showCompleted ? t.is_completed : !t.is_completed)}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TodoItem
          item={item}
          onComplete={async (taskId) => {
            const res = await completeTask(taskId);
            if (res) Alert.alert("Done", `+${res.xp_gained} XP`);
          }}
          onDelete={async (taskId) => {
            const ok = await deleteTask(taskId);
            if (!ok) Alert.alert("Błąd", "Nie udało się usunąć zadania");
          }}
          onLongPress={() => setEditingTodo(item)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 120 }}
      keyboardShouldPersistTaps="handled"
    />
  )}

  <BottomInputBar
    quickText={quickText}
    setQuickText={setQuickText}
    onQuickAdd={onQuickAdd}
    onOpenDifficulty={() => setShowDifficulty(true)}
  />
</KeyboardAvoidingView>


    </View>
  );
}
