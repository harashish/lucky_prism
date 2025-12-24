import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useTodoStore } from "../stores/useTodoStore";
import { useRouter } from "expo-router";
import TodoItem from "../../features/todos/TodoItem";
import BottomInputBar from "../../components/BottomInputBar";
import CustomDifficultyPicker from "../../features/todos/customDifficultyPicker";
import EditTodoPopup from "../../features/todos/editTodoPopup";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import { useFocusEffect } from "@react-navigation/native";

export default function TodosScreen() {
  const router = useRouter();

  const {
    categories,
    tasks,
    loadCategories,
    loadTasks,
    quickAddTask,
    completeTask,
    deleteTask,
    selectedCategoryId,
    setSelectedCategoryId,
    checkCategoryHasTasks,
  } = useTodoStore();

  const [quickText, setQuickText] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<number | null>(null);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  // ---- reload categories on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  // ---- ensure selected category exists
  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }

    const exists = categories.some(c => c.id === selectedCategoryId);
    if (!exists) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  // ---- load tasks + sync "has tasks" flag
  useEffect(() => {
    if (selectedCategoryId !== null) {
      loadTasks(selectedCategoryId);
      checkCategoryHasTasks(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const onQuickAdd = async () => {
    if (!quickText.trim()) return;
    if (!selectedCategoryId) return;

    const res = await quickAddTask(
      selectedCategoryId,
      quickText.trim(),
      customDifficulty
    );

    if (res) {
      setQuickText("");
      setCustomDifficulty(null);
    } else {
      Alert.alert("Error", "Cannot add todo.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Difficulty Popup */}
      {showDifficulty && (
        <CustomDifficultyPicker
          onSelect={(d: any) => {
            setCustomDifficulty(d.id);
            setShowDifficulty(false);
          }}
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
            await loadTasks(selectedCategoryId!);
            checkCategoryHasTasks(selectedCategoryId!);
          }}
          onDelete={async (taskId: number) => {
            const ok = await deleteTask(taskId);
            if (!ok) {
              Alert.alert("Error", "Failed to delete task");
            }
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
                backgroundColor:
                  selectedCategoryId === cat.id
                    ? colors.buttonActive
                    : cat.color || colors.card,
                minWidth: 80,
                alignItems: "center",
              }}
            >
              <AppText>{cat.name}</AppText>
              {gamificationOn && (
                <AppText style={{ fontSize: 12 }}>
                  {cat.difficulty?.name}
                </AppText>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.push("/addCategory")}
            style={{
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.buttonActive,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* TOGGLE COMPLETED */}
      <TouchableOpacity
        onPress={() => setShowCompleted(prev => !prev)}
        style={{
          padding: 8,
          marginBottom: 12,
          backgroundColor: colors.buttonActive,
          alignItems: "center",
        }}
      >
        <AppText style={{ color: "#fff" }}>
          {showCompleted ? "Show todo" : "Show completed"}
        </AppText>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
      >
        {tasks.filter(t =>
          showCompleted ? t.is_completed : !t.is_completed
        ).length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <AppText style={{ color: "#777", fontSize: 16 }}>
              {showCompleted
                ? "no completed tasks yet"
                : "no active tasks in this category yet, add some!"}
            </AppText>
          </View>
        ) : (
          <FlatList
            data={tasks.filter(t =>
              showCompleted ? t.is_completed : !t.is_completed
            )}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TodoItem
                item={item}
                onComplete={async (taskId) => {
                  const res = await completeTask(taskId);

                  if (res && gamificationOn && res.xp_gained > 0) {
                    useGamificationStore
                      .getState()
                      .applyXpResult(res);
                  }
                }}
                onDelete={async (taskId) => {
                  const ok = await deleteTask(taskId);
                  if (!ok) {
                    Alert.alert("Błąd", "Nie udało się usunąć zadania");
                  }
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
