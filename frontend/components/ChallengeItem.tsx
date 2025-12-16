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
  const [localProgress, setLocalProgress] = useState<number | null>(item.progress_percent ?? null);

  const assignChallenge = async () => {
    if (!userId) return;
    try {
      await api.post("/challenges/assign/", { user: userId, challenge: item.id });
      Alert.alert("Sukces", "Challenge przypisany do użytkownika!");
      onAssigned?.();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      if (detail === "Active daily challenge already exists") {
        Alert.alert("Błąd", "Masz już aktywny Daily challenge!");
      } else if (detail === "Active weekly challenge already exists") {
        Alert.alert("Błąd", "Masz już aktywny Weekly challenge!");
      } else {
        Alert.alert("Błąd", "Nie udało się przypisać challenge.");
      }
    }
  };

  const completeChallenge = async () => {
    if (!item.userChallengeId || !userId) return;
    try {
      await api.post(`/challenges/user-challenges/${item.userChallengeId}/complete/`);
      Alert.alert("Ukończono", `  XP za "${item.title}"`);

      const { userChallenges } = useChallengeStore.getState();
      useChallengeStore.setState({
        userChallenges: userChallenges.filter(uc => uc.id !== item.userChallengeId)
      });

      onAssigned?.();
    } catch {
      Alert.alert("Błąd", "Nie udało się ukończyć challenge.");
    }
  };

  // Symulacja przyspieszenia tygodnia o 1 dzień
  const accelerateWeek = () => {
    if (localProgress === null) return;
    const newProgress = Math.min(100, localProgress + Math.round(100 / 7)); // dodajemy ~14% dla 7 dni
    setLocalProgress(newProgress);
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
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity onPress={completeChallenge} style={components.completeButton}>
                <AppText style={{ color: "#fff", fontSize: 14 }}>Ukończ</AppText>
              </TouchableOpacity>

              {item.challenge_type === "Weekly" && (
                <TouchableOpacity onPress={accelerateWeek} style={{ ...components.addButton, backgroundColor: "#f39c12" }}>
                  <AppText style={{ color: "#fff", fontSize: 12 }}>Przyspiesz +1d</AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Weekly progress bar */}
        {alreadyAssigned && localProgress != null && (
          <View style={{ marginTop: 8 }}>
            <View style={{ height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" }}>
              <View style={{
                width: `${localProgress}%`,
                height: "100%",
                backgroundColor: colors.buttonActive
              }} />
            </View>
            <AppText style={{ fontSize: 12, marginTop: 2, color: colors.text }}>
              {localProgress}% {item.challenge_type === "Weekly" ? "tygodnia" : "dnia"}
            </AppText>
          </View>
        )}

        {expanded && (
  <View style={{ marginTop: spacing.s }}>
    {/* pokaż opis tylko jeśli nie jest pusty */}
    {item.description?.trim() ? (
      <AppText>{item.description}</AppText>
    ) : null}

    <AppText>Difficulty: {item.difficulty.name}</AppText>
    <AppText>
      Tags: {item.tags.length ? item.tags.map((t) => t.name).join(", ") : "Brak"}
    </AppText>
  </View>
)}

      </View>
    </TouchableOpacity>
  );
}
