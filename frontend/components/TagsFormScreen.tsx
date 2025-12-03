import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

type Tag = {
  id: number;
  name: string;
};

type Props = {
  editingTagId?: number; // jeśli istnieje → edycja
};

const TagsFormScreen = ({ editingTagId }: Props) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTagId) {
      const fetchTag = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://127.0.0.1:8000/api/tags/${editingTagId}/`);
          setName(res.data.name);
        } catch (err: any) {
          console.error("Błąd pobierania tagu:", err.response?.data || err.message);
          setError("Nie udało się pobrać tagu");
        } finally {
          setLoading(false);
        }
      };
      fetchTag();
    }
  }, [editingTagId]);

  const saveTag = async () => {
    if (!name) {
      setError("Podaj nazwę tagu");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (editingTagId) {
        await axios.patch(`http://127.0.0.1:8000/api/tags/${editingTagId}/`, { name });
        console.log("Zaktualizowano tag");
      } else {
        await axios.post("http://127.0.0.1:8000/api/tags/", { name });
        console.log("Dodano tag");
      }
      router.back();
    } catch (err: any) {
      console.error("Błąd zapisu tagu:", err.response?.data || err.message);
      setError("Nie udało się zapisać tagu");
    } finally {
      setLoading(false);
    }
  };

const deleteTag = async () => {
  if (!editingTagId) return;
  setLoading(true);
  setError(null);

  try {
    await axios.delete(`http://127.0.0.1:8000/api/tags/${editingTagId}/`);
    console.log("Usunięto tag");
    router.back();
  } catch (err: any) {
    console.error("Błąd usuwania tagu:", err.response?.data || err.message);

    // Sprawdzenie czy backend blokuje usunięcie powiązanego tagu
    if (err.response?.status === 400 && err.response.data?.detail) {
      setError("Nie można usunąć tagu, który jest powiązany z challenge.");
    } else {
      setError("Nie udało się usunąć tagu");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {editingTagId ? "Edytuj tag" : "Dodaj tag"}
      </Text>

      <Text>Nazwa tagu:</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      <TouchableOpacity
        onPress={saveTag}
        style={{ backgroundColor: "#4caf50", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: editingTagId ? 10 : 0 }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>{editingTagId ? "Zapisz zmiany" : "Dodaj tag"}</Text>}
      </TouchableOpacity>

      {editingTagId && (
        <TouchableOpacity
          onPress={deleteTag}
          style={{ backgroundColor: "#f44336", padding: 15, borderRadius: 10, alignItems: "center" }}
          disabled={loading}
        >
          <Text style={{ color: "#fff" }}>Usuń tag</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default TagsFormScreen;
