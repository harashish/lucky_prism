
// components/ChallengeItem.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Challenge } from "../app/stores/useChallengeStore";
import { router } from "expo-router";

type Props = {
  item: Challenge;
  onLongPress?: (item: Challenge) => void; // opcjonalny callback
};

export default function ChallengeItem({ item, onLongPress }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
    onPress={() => setExpanded(prev => !prev)}
    onLongPress={() => router.push(`/editChallenge/${item.id}`)}
    delayLongPress={300}
      >
      <View
        style={{
          padding: 10,
          marginVertical: 5,
          borderRadius: 10,
          backgroundColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>
          {item.title} ({item.difficulty.xp_value} XP)
        </Text>

        {expanded && (
          <>
            <Text>{item.description}</Text>
            <Text>Difficulty: {item.difficulty.name}</Text>
            <Text>Tags: {item.tags.map((t) => t.name).join(", ")}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
