import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AppText from "../../components/AppText";
import { colors, radius } from "../../constants/theme";
import { useTodoStore } from "../stores/useTodoStore";
import { useRouter } from "expo-router";
import TodoItem from "../../features/todos/TodoItem";
import BottomInputBar from "../../features/todos/BottomInputBar";
import CustomDifficultyPicker from "../../features/todos/customDifficultyPicker";
import EditTodoPopup from "../../features/todos/editTodoPopup";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import { useFocusEffect } from "@react-navigation/native";
// import DraggableFlatList from "react-native-draggable-flatlist";

export default function TodosScreen() {
  const router = useRouter();

  const {
    categories,
    tasks,
    loading,
    loadCategories,
    loadTasks,
    quickAddTask,
    completeTask,
    deleteTask,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useTodoStore();

  
  const [quickText, setQuickText] = useState("");
  const [customDifficulty, setCustomDifficulty] = useState<number | null>(null);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }

    if (
      selectedCategoryId === null ||
      !categories.some((c) => c.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (selectedCategoryId !== null) {
      loadTasks(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const onQuickAdd = async () => {
    if (!quickText.trim() || !selectedCategoryId) return;

    try {
      await quickAddTask(
        selectedCategoryId,
        quickText.trim(),
        customDifficulty
      );
      setQuickText("");
      setCustomDifficulty(null);
    } catch {
      Alert.alert("Error", "Cannot add todo.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {showDifficulty && (
        <CustomDifficultyPicker
          onSelect={(d: any) => {
            setCustomDifficulty(d.id);
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
            await loadTasks(selectedCategoryId!);
          }}
          onDelete={async (taskId: number) => {
            try {
              await deleteTask(taskId);
            } catch {
              Alert.alert("Error", "Failed to delete task");
            }
          }}
        />
      )}

      <View style={{ flexDirection: "row", marginBottom: 12, padding: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              onLongPress={() => router.push(`/editCategory/${cat.id}`)}
              style={{
                padding: 12,
                marginRight: 8,
                borderRadius: radius.md,
                backgroundColor: cat.color || colors.card,
                minWidth: 80,
                alignItems: "center",
                borderWidth: 2,
                borderColor: selectedCategoryId === cat.id
                  ? colors.light
                  : "transparent",
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
              borderRadius: radius.md,
              backgroundColor: colors.buttonActive,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <TouchableOpacity
        onPress={() => setShowCompleted((prev) => !prev)}
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
        {loading.tasks ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color={colors.buttonActive} />
          </View>
        ) : tasks.filter((t) =>
            showCompleted ? t.is_completed : !t.is_completed
          ).length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <AppText style={{ color: "#777" }}>
              {showCompleted
                ? "no completed tasks yet"
                : "no tasks in this category yet"}
            </AppText>
          </View>
) : (
  <FlatList
    data={tasks.filter((t) =>
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
          try {
            await deleteTask(taskId);
          } catch {
            Alert.alert("Error", "Cannot delete task");
          }
        }}
        onLongPress={() => setEditingTodo(item)}
      />
    )}
    contentContainerStyle={{ paddingBottom: 120 }}
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
