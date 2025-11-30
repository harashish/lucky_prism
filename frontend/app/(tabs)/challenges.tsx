import { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useChallengeStore } from "../stores/useChallengeStore";

export default function ChallengesScreen() {
  const { challenges, loading, loadChallenges } = useChallengeStore();

  useEffect(() => {
    loadChallenges();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges</Text>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.cardDesc}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 14,
    marginTop: 5,
    color: "#555",
  },
});
