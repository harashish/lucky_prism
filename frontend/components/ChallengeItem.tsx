// frontend/components/ChallengeItem.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useChallengeStore, ChallengeWithUserInfo } from "../app/stores/useChallengeStore";
import AppText from "../components/AppText";
import { colors, components, radius, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";

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

  
  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

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

    if (gamificationOn) {
      Alert.alert("Ukończono", `Challenge "${item.title}" ukończony`);
    } else {
      Alert.alert("Ukończono", item.difficulty.name);
    }

    const { userChallenges } = useChallengeStore.getState();
    useChallengeStore.setState({
      userChallenges: userChallenges.filter(
        uc => uc.id !== item.userChallengeId
      ),
    });

    onAssigned?.();
  } catch {
    Alert.alert("Błąd", "Nie udało się ukończyć challenge.");
  }
};

  

  const [localDays, setLocalDays] = useState<number>(
  item.challenge_type === "Weekly" && localProgress != null
    ? Math.round((localProgress / 100) * 7) // konwersja % → dni
    : localProgress
);

const accelerateWeek = () => {
  if (localDays == null) return;
  setLocalDays(prev => Math.min(7, prev + 1)); // dodaj 1 dzień, max 7
};

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/editChallenge/${item.id}`)}
      delayLongPress={300}
    >
      <View style={components.container}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
  {/* Tekst challenge */}
  <View style={{ flex: 1, minWidth: 0 }}>
      <AppText style={{ fontWeight: "bold", flexWrap: "wrap" }}>
        {item.title}
        {gamificationOn ? ` (${item.difficulty.xp_value} XP)` : ""}
      </AppText>


  </View>

  {/* Przycisk lub zestaw przycisków */}
  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8, flexShrink: 0, gap: 8 }}>
    {userId && !alreadyAssigned && (
      <TouchableOpacity onPress={assignChallenge} style={components.addButton}>
        <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
      </TouchableOpacity>
    )}

    {userId && alreadyAssigned && (
      <>
        <TouchableOpacity onPress={completeChallenge} style={components.completeButton}>
          <AppText style={{ color: "#fff", fontSize: 14 }}>Ukończ</AppText>
        </TouchableOpacity>

        {item.challenge_type === "Weekly" && (
          <TouchableOpacity onPress={accelerateWeek} style={{ ...components.addButton, backgroundColor: "#f39c12" }}>
            <AppText style={{ color: "#fff", fontSize: 12 }}>Przyspiesz +1d</AppText>
          </TouchableOpacity>
        )}
      </>
    )}
  </View>
</View>

        {/* Weekly progress bar */}
{alreadyAssigned && localDays != null && item.challenge_type === "Weekly" && (
  <View style={{ marginTop: 8 }}>
    <View style={{ height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" }}>
      <View style={{
        width: `${(localDays / 7) * 100}%`,
        height: "100%",
        backgroundColor: colors.buttonActive
      }} />
    </View>
    <AppText style={{ fontSize: 12, marginTop: 2, color: colors.text }}>
      {localDays}/7 dni
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
