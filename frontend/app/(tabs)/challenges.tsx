import { useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { useChallengesStore } from "../stores/useChallengesStore";
import { useAuthStore } from "../stores/useAuthStore";

export default function ChallengesScreen() {
  const { templates, fetchTemplates, userChallenges, fetchUserChallenges, drawChallenge } =
    useChallengesStore();

  const { token } = useAuthStore();

  useEffect(() => {
    fetchTemplates();
    if (token) fetchUserChallenges(token);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Challenge templates</Text>

      <FlatList
        data={templates}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text>{item.title} ({item.scope})</Text>
            <Text style={{ color: "#666" }}>{item.description}</Text>
          </View>
        )}
      />

      <Button title="Draw weekly challenge" onPress={() => drawChallenge(token, "weekly")} />

      <Text style={{ fontSize: 18, marginTop: 16 }}>Active</Text>

      <FlatList
        data={userChallenges}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderBottomWidth: 1 }}>
            <Text>
              {item.template.title} — {item.completed ? "Done" : "Pending"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
