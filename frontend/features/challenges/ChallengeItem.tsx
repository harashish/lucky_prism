import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useChallengeStore, ChallengeWithUserInfo } from "../../app/stores/useChallengeStore";
import AppText from "../../components/AppText";
import { colors, components, spacing } from "../../constants/theme";
import { api } from "../../app/api/apiClient";
import { useModuleSettingsStore } from "../../app/stores/useModuleSettingsStore";
import { useGamificationStore } from "../../app/stores/useGamificationStore";
import { ItemHeader } from "../../components/ItemHeader";
import { ItemDetails } from "../../components/ItemDetails";

type Props = {
  item: ChallengeWithUserInfo;
  onLongPress?: (item: ChallengeWithUserInfo) => void;
  userId?: number;
  alreadyAssigned?: boolean;
  onAssigned?: () => void;
};

export default function ChallengeItem({ item, userId, alreadyAssigned, onAssigned }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;



 const assignChallenge = async () => {
    if (!userId) return;
    try {
      await api.post("/challenges/assign/", { user: userId, challenge: item.id });
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

  const days =
  item.challenge_type === "Weekly"
    ? item.progress_days ?? 1
    : null;

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/editChallenge/${item.id}`)}
      delayLongPress={300}
    >
      <View style={components.container}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <ItemHeader
          title={item.title}
          difficulty={item.difficulty?.name}
        />


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
          </>
        )}
        </View>
     </View>

      {/* Weekly progress bar */}
      {alreadyAssigned && days != null && item.challenge_type === "Weekly" && (
        <>
          <View style={{ height: 8, backgroundColor: "#eee", borderRadius: 4 }}>
            <View
              style={{
                width: `${(days / 7) * 100}%`,
                height: "100%",
                backgroundColor: colors.buttonActive,
              }}
            />
          </View>
          <AppText style={{ fontSize: 12, marginTop: 2 }}>
            {days}/7 dni
          </AppText>
        </>
      )}



      {expanded && (
      <ItemDetails
        description={item.description}
      />
      )}

    </View>
  </TouchableOpacity>
  );
}
