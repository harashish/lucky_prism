// challengeForm.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useChallengeStore, ChallengeTag, DifficultyType, ChallengeType, Challenge } from "../app/stores/useChallengeStore";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";

const ChallengeFormScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { tags, loadTags, loadChallenges } = useChallengeStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChallengeType | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyType | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editingChallengeId = params?.id ? parseInt(params.id as string, 10) : null;

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    // jeśli edytujemy, wypełnij pola
    if (editingChallengeId) {
      const fetchChallenge = async () => {
        try {
          const res = await axios.get(`http://127.0.0.1:8000/api/challenges/${editingChallengeId}/`);
          const c: Challenge = res.data;
          setTitle(c.title);
          setDescription(c.description);
          setType(c.type);
          setDifficulty(c.difficulty);
          setSelectedTags(c.tags.map(t => t.id));
        } catch (err) {
          console.error("Błąd pobierania challenge:", err);
        }
      };
      fetchChallenge();
    }
  }, [editingChallengeId]);

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

const deleteChallenge = async () => {
  if (!editingChallengeId) return;

  setLoading(true);
  try {
    console.log("Wysyłam DELETE:", editingChallengeId);

    const res = await axios.delete(
      `http://127.0.0.1:8000/api/challenges/${editingChallengeId}/`
    );

    console.log("DELETE response:", res.status, res.data);
    
    // odśwież listę w Zustand
    loadChallenges();

    // wróć do listy
    router.push("/ChallengeListScreen");
  } catch (err: any) {
    console.error("Błąd usuwania challenge:", err.response?.data || err.message);
    setError("Nie udało się usunąć challenge");
  } finally {
    setLoading(false);
  }
};


  const saveChallenge = async () => {
    if (!title || !type || !difficulty || selectedTags.length === 0) {
      setError("Uzupełnij wszystkie pola i wybierz przynajmniej jeden tag");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingChallengeId) {
        // edycja - PATCH
        await axios.patch(`http://127.0.0.1:8000/api/challenges/${editingChallengeId}/`, {
          title,
          description,
          type_id: type.id,
          difficulty_id: difficulty.id,
          tags_ids: selectedTags
        });
        console.log("Zaktualizowano challenge");
      } else {
        // dodawanie - POST
        await axios.post("http://127.0.0.1:8000/api/challenges/", {
          title,
          description,
          type_id: type.id,
          difficulty_id: difficulty.id,
          tags_ids: selectedTags
        });
        console.log("Dodano challenge");
      }

      loadChallenges();
      router.push("/ChallengeListScreen");
    } catch (err: any) {
  console.error("AXIOS ERROR OBJECT:", err);
  console.error("AXIOS ERROR RESPONSE:", err.response?.data);
  console.error("AXIOS ERROR STATUS:", err.response?.status);
  setError("Nie udało się zapisać challenge: " + err.response?.data?.detail || err.message);
} finally {
      setLoading(false);
    }

  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1, padding: 10 }}>
      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {editingChallengeId ? "Edytuj challenge" : "Dodaj challenge"}
      </Text>


      <Text>Nazwa:</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      <Text>Opis:</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      <Text>Typ:</Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["Daily", "Weekly"].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setType({ id: t === "Daily" ? 1 : 2, name: t })}
            style={{
              padding: 10,
              marginRight: 5,
              borderRadius: 10,
              backgroundColor: type?.name === t ? "#4caf50" : "#ccc"
            }}
          >
            <Text>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>Trudność:</Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {[
          { id: 1, name: "Easy", xp_value: 10 },
          { id: 2, name: "Medium", xp_value: 25 },
          { id: 3, name: "Hard", xp_value: 50 }
        ].map(d => (
          <TouchableOpacity
            key={d.id}
            onPress={() => setDifficulty(d)}
            style={{
              padding: 10,
              marginRight: 5,
              borderRadius: 10,
              backgroundColor: difficulty?.id === d.id ? "#2196f3" : "#ccc"
            }}
          >
            <Text>{d.name} ({d.xp_value} XP)</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>Tagi:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            onPress={() => toggleTag(tag.id)}
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
      </ScrollView>

<TouchableOpacity
      onPress={saveChallenge}
      style={{ backgroundColor: "#4caf50", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: editingChallengeId ? 10 : 0 }}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>{editingChallengeId ? "Zapisz zmiany" : "Dodaj challenge"}</Text>}
    </TouchableOpacity>

    {editingChallengeId && (
      <TouchableOpacity
        onPress={deleteChallenge}
        style={{ backgroundColor: "#f44336", padding: 15, borderRadius: 10, alignItems: "center" }}
        disabled={loading}
      >
        <Text style={{ color: "#fff" }}>Usuń challenge</Text>
      </TouchableOpacity>
    )}
  </ScrollView>
  );
};

export default ChallengeFormScreen;
