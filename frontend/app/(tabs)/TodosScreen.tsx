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
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { useGamificationStore } from "../stores/useGamificationStore";
import { useFocusEffect } from "@react-navigation/native";
import { useUserPreferencesStore } from "../stores/useUserPreferenceStore";
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
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);


  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const { hideTodoCompletedToggle } = useUserPreferencesStore();
  const { defaultTodoCategoryId } = useUserPreferencesStore();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );
useEffect(() => {
  if (!categories.length) return;

  // jeśli selectedCategoryId już ustawione → nic nie rób
  if (selectedCategoryId !== null) return;

  // jeśli jest default i istnieje → użyj go
  if (defaultTodoCategoryId) {
    const exists = categories.find(
      c => c.id === defaultTodoCategoryId
    );
    if (exists) {
      setSelectedCategoryId(defaultTodoCategoryId);
      return;
    }
  }

  // fallback
  setSelectedCategoryId(categories[0].id);
}, [categories]);

// load tasks when category changes
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

<View
  style={{
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  }}
>

  {/* CENTERED CATEGORY */}
  <TouchableOpacity
    onPress={() => setShowCategoryDropdown(prev => !prev)}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <AppText style={{ fontSize: 16 }}>
        {
          categories.find(c => c.id === selectedCategoryId)?.name
          || "Select category"
        }
      </AppText>
      <AppText style={{ marginLeft: 6 }}>▾</AppText>
    </View>
  </TouchableOpacity>

<View
  style={{
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
  }}
>

  {/* TOGGLE COMPLETED */}
    {!hideTodoCompletedToggle && (
  <TouchableOpacity
    onPress={() => setShowCompleted(prev => !prev)}
    style={{
      marginRight: 16,
      opacity: showCompleted ? 1 : 0.5,
    }}
  >
    
    <AppText style={{ fontSize: 25 }}>
      {showCompleted ? "☑" : "☐"}
    </AppText>
  </TouchableOpacity>
  )}

  {/* ADD CATEGORY */}
  <TouchableOpacity
    onPress={() => router.push("/addCategory")}
  >
    <AppText style={{ fontSize: 20 }}>＋</AppText>
  </TouchableOpacity>
    

</View>

</View>

{showCategoryDropdown && (
  <View
    style={{
      position: "absolute",
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      zIndex: 100,
      borderBottomWidth: 1,
      borderBottomColor: "#222",
    }}
  >
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat.id}
        onPress={() => {
          setSelectedCategoryId(cat.id);
          setShowCategoryDropdown(false);
        }}
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#222",
        }}
      >
        <AppText>{cat.name}</AppText>
      </TouchableOpacity>
    ))}
  </View>
)}


      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
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

    ItemSeparatorComponent={() => (
      <View style={{ height: 1, backgroundColor: "#575757" }} />
    )}
    
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
        onLongPress={() => router.push(`/editTodo/${item.id}`)}
      />
    )}
    contentContainerStyle={{ paddingBottom: 120, paddingTop: 0 }}
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
