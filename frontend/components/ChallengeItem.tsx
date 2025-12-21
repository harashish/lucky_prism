import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useChallengeStore, ChallengeWithUserInfo } from "../app/stores/useChallengeStore";
import AppText from "../components/AppText";
import { colors, components, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";
import { useGamificationStore } from "../app/stores/useGamificationStore";

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
      // powodzenie: odśwież dane, nie pokazuj alertu — prosta UX decyzja
      onAssigned?.();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      if (detail === "Active daily challenge already exists") {
        Alert.alert("Error", "You already have an active Daily challenge!");
      } else if (detail === "Active weekly challenge already exists") {
        Alert.alert("Error", "You already have an active Weekly challenge!");
      } else {
        Alert.alert("Error", "Cannot assign challenge.");
      }
    }
  };

  const completeChallenge = async () => {
    if (!item.userChallengeId || !userId) return;

    try {
      const res = await api.post(`/challenges/user-challenges/${item.userChallengeId}/complete/`);
      const data = res.data; // { xp_gained, total_xp, current_level }

      // jeśli gamification włączona i są xp -> użyj store aby wyzwolić XPPopup
      if (gamificationOn && data && data.xp_gained && data.xp_gained > 0) {
        useGamificationStore.getState().applyXpResult(data);
      }

      // usuń challenge z lokalnego stanu (jak wcześniej)
      const { userChallenges } = useChallengeStore.getState();
      useChallengeStore.setState({
        userChallenges: userChallenges.filter(uc => uc.id !== item.userChallengeId),
      });

      onAssigned?.();
    } catch (err) {
      Alert.alert("Error", "Cannot complete challenge.");
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
       <View style={{ flex: 1 }}>
      <AppText style={{ fontWeight: "bold", flexWrap: "wrap" }}>
        {item.title}
      </AppText>


      <AppText
        style={{
          fontSize: 12,
          color: "#777",
        }}
      >
        {item.difficulty.name}
      </AppText>
            </View>


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
        {item.description?.trim() ? (
          <AppText>{item.description}</AppText>
        ) : null}
      </View>
      )}

    </View>
  </TouchableOpacity>
  );
}
