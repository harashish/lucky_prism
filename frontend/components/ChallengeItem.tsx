// frontend/components/ChallengeItem.tsx

import React, { useState } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useChallengeStore, ChallengeWithUserInfo } from "../app/stores/useChallengeStore";
import AppText from "../components/AppText";
import { colors, components, radius, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";

type Props = {
  item: ChallengeWithUserInfo;
  onLongPress?: (item: ChallengeWithUserInfo) => void;
  userId?: number;
  alreadyAssigned?: boolean;
  onAssigned?: () => void;
};

export default function ChallengeItem({ item, userId, alreadyAssigned, onAssigned }: Props) {
  const [expanded, setExpanded] = useState(false);

  const assignChallenge = async () => {
    if (!userId) return;
    try {
      await api.post("/challenges/assign/", {
        user_id: userId,
        challenge_id: item.id
      });
      Alert.alert("Sukces", "Challenge przypisany do użytkownika!");
      onAssigned?.();
    } catch {
      Alert.alert("Błąd", "Nie udało się przypisać challenge.");
    }
  };

  const completeChallenge = async () => {
    if (!item.userChallengeId || !userId) return;
    try {
      await api.post(
        `/challenges/user-challenges/${item.userChallengeId}/complete/`
      );
      Alert.alert("Ukończono", `Otrzymano XP za "${item.title}"`);

      const { userChallenges } = useChallengeStore.getState();
      useChallengeStore.setState({
        userChallenges: userChallenges.filter(uc => uc.id !== item.userChallengeId)
      });

      onAssigned?.();
    } catch {
      Alert.alert("Błąd", "Nie udało się ukończyć challenge.");
    }
  };

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/editChallenge/${item.id}`)}
      delayLongPress={300}
    >
      <View style={components.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText style={{ fontWeight: "bold" }}>
            {item.title} ({item.difficulty.xp_value} XP)
          </AppText>

          {userId && !alreadyAssigned && (
            <TouchableOpacity onPress={assignChallenge} style={components.addButton}>
              <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
            </TouchableOpacity>
          )}

          {userId && alreadyAssigned && (
            <TouchableOpacity onPress={completeChallenge} style={components.completeButton}>
              <AppText style={{ color: "#fff", fontSize: 14 }}>Ukończ</AppText>
            </TouchableOpacity>
          )}
        </View>

        {expanded && (
          <View style={{ marginTop: spacing.s }}>
            <AppText>{item.description}</AppText>
            <AppText>Difficulty: {item.difficulty.name}</AppText>
            <AppText>Tags: {item.tags.map((t) => t.name).join(", ")}</AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

