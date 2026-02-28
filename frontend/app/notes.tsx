import React, { useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AppText from "../components/AppText";
import { colors, spacing } from "../constants/theme";
import { useNotesStore } from "./stores/useNotesStore";

export default function NotesListScreen() {
  const router = useRouter();
  const { notes, fetchNotes, loading } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, []);

  if (loading && !notes.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.m }}
        ListEmptyComponent={
          <AppText>No notes yet</AppText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/notes/form",
                params: { id: item.id },
              })
            }
            style={{
              paddingVertical: spacing.m,
              borderBottomWidth: 1,
              borderColor: colors.card,
            }}
          >
            <AppText numberOfLines={2}>
              {item.content}
            </AppText>
          </TouchableOpacity>
        )}
      />

      {/* add note button */}
      <TouchableOpacity
        onPress={() => router.push("/addNote")}
        style={{
          position: "absolute",
          bottom: 40,
          right: 20,
          backgroundColor: colors.buttonActive,
          padding: 16,
          borderRadius: 999,
        }}
      >
        <AppText style={{ color: "#fff" }}>+</AppText>
      </TouchableOpacity>
    </View>
  );
}