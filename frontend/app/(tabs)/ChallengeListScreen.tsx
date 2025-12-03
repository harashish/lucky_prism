import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useChallengeStore } from "../stores/useChallengeStore";
import ChallengeItem from "../../components/ChallengeItem";
import { useRouter } from "expo-router";

const ChallengeListScreen = () => {
  const router = useRouter();
  const { challenges, tags, loadChallenges, loadTags } = useChallengeStore();
  const [selectedType, setSelectedType] = useState<"Daily" | "Weekly">("Daily");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await loadChallenges();
      await loadTags();
    };
    fetchData();
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredChallenges = challenges.filter(c =>
    c.type.name === selectedType &&
    (selectedTags.length === 0 || selectedTags.every(tid => c.tags.some(t => t.id === tid)))
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Typy */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["Daily", "Weekly"].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setSelectedType(t as "Daily" | "Weekly")}
            style={{
              padding: 10,
              marginRight: 5,
              borderRadius: 10,
              backgroundColor: selectedType === t ? "#4caf50" : "#ccc"
            }}
          >
            <Text>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtr tagów */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => toggleTag(tag.id)}            // zwykły klik → filtr
            onLongPress={() => router.push(`/editTag/${tag.id}`)} // long press → edycja
            delayLongPress={300}
            style={{
              padding: 8,
              marginRight: 5,
              borderRadius: 10,
              backgroundColor: selectedTags.includes(tag.id) ? "#2196f3" : "#ddd"
            }}
          >
            <Text>{tag.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => router.push("/addTag")}
          style={styles.addTagButton}
        >
          <Text style={{ fontSize: 24, color: "#fff" }}>＋</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista challengy */}
      <FlatList
        data={filteredChallenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChallengeItem item={item} />}
      />

      {/* Floating button do dodawania challengy */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={async () => {
          await loadChallenges(); // dodatkowe odświeżenie przy wejściu
          router.push("/addChallenge");
        }}
      >
        <Text style={{ fontSize: 32, color: "#fff" }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChallengeListScreen;

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2196f3",
    justifyContent: "center",
    alignItems: "center",
  }
});
