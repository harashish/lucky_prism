import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import AppText from "../../../components/AppText";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useTodoStore } from "../../stores/useTodoStore";
import RandomSpin from "../spin";

export default function TodoPickScreen() {
  const router = useRouter();

  const {
    categories,
    loadCategories,
    fetchRandomTask,
    hasUncompletedTasksInSelectedCategory,
    checkCategoryHasUncompletedTasks,
  } = useTodoStore();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinItems, setSpinItems] = useState<string[]>([]);

  // ---- load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // ---- auto-select first category
  useEffect(() => {
    if (!categories.length) return;
    if (selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  // ---- check if selected category has tasks
  useEffect(() => {
    if (selectedCategory !== null) {
      checkCategoryHasUncompletedTasks(selectedCategory);
    }
  }, [selectedCategory]);

  const onLosuj = async () => {
    if (!selectedCategory) {
      Alert.alert("Choose a category");
      return;
    }

    if (hasUncompletedTasksInSelectedCategory === false) {
      Alert.alert("No tasks in this category.");
      return;
    }

    setSpinning(true);
    setSpinItems(["...", "Randomizing", "Searching", "Wait", "OK"]);

    const picked = await fetchRandomTask(selectedCategory);

    if (!picked) {
      setSpinning(false);
      Alert.alert("No tasks in this category.");
      return;
    }

    setTimeout(() => {
      setSpinning(false);
      router.push({
        pathname: "/random/result",
        params: {
          item: JSON.stringify(picked),
          source: "todo",
          categoryId: String(selectedCategory),
        },
      });
    }, 600);
  };

  if (spinning) {
    return (
      <RandomSpin
        items={spinItems.length ? spinItems : ["..."]}
        onFinish={() => {}}
      />
    );
  }

  const randomDisabled = hasUncompletedTasksInSelectedCategory === false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* RANDOM BUTTON */}
        <TouchableOpacity
          disabled={randomDisabled}
          onPress={onLosuj}
          style={{
            backgroundColor: randomDisabled
              ? colors.card
              : colors.buttonActive,
            padding: 16,
            borderRadius: 10,
            marginBottom: 8,
            width: "80%",
            alignItems: "center",
            opacity: randomDisabled ? 0.6 : 1,
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            Randomize!
          </AppText>
        </TouchableOpacity>

        {/* EMPTY INFO */}
        {hasUncompletedTasksInSelectedCategory === false && (
          <AppText style={{ marginBottom: 12, color: "#999" }}>
            No tasks in this category
          </AppText>
        )}

        <AppText style={{ marginBottom: 8 }}>Choose a category:</AppText>

        {/* CATEGORY PICKER */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={{
                padding: 8,
                margin: 6,
                borderRadius: 8,
                backgroundColor:
                  selectedCategory === c.id
                    ? colors.buttonActive
                    : colors.card,
              }}
            >
              <AppText>{c.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
