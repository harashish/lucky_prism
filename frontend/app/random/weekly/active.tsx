import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useModuleSettingsStore } from "../../stores/useModuleSettingsStore";
import { useGamificationStore } from "../../stores/useGamificationStore";

export default function WeeklyActiveScreen() {
  const router = useRouter();
  const userId = 1;
  const { fetchActive, activeWeekly, discardUserChallenge, completeUserChallenge } = useChallengeStore();
  const [loading, setLoading] = useState(true);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;


  useEffect(() => {
    const load = async () => {
      await fetchActive(userId);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !activeWeekly || activeWeekly.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  const uc = activeWeekly[0];
  const ch = uc.challenge;
  const days = uc.progress_days ?? 1;


  const tryAnother = async () => {
    const ok = await discardUserChallenge(uc.id);
    if (!ok) return Alert.alert("Error", "Could not discard the challenge");

    await fetchActive(userId);
    const { activeWeekly: latestActive } = useChallengeStore.getState();
    router.replace(latestActive && latestActive.length > 0 ? "/random/weekly/active" : "/random/weekly");
  };

  const onComplete = async () => {
    const res = await completeUserChallenge(uc.id);
    if (!res) return Alert.alert("Error", "Could not complete the challenge");
    
    if (gamificationOn) {
      useGamificationStore.getState().applyXpResult(res);
    }


    await fetchActive(userId);
    router.replace("/(tabs)/RandomHomeScreen");
  };

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: "center" }}>
        <AppText style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12, color: colors.light, fontStyle: "italic" }}>
           You have an active weekly challenge!
      </AppText>
      <AppText style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 , lineHeight: 24, paddingBottom: 2 }}>{ch?.title}</AppText>
      <AppText style={{ marginBottom: 18, marginTop: 5 }}>{ch?.description}</AppText>

      <View
        style={{
          height: 10,
          backgroundColor: colors.card,
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: `${(days / 7) * 100}%`,
            height: 10,
            backgroundColor: colors.buttonActive,
          }}
        />
      </View>

      <AppText style={{ marginBottom: 14 }}>
        {days}/7 days
      </AppText>


      <TouchableOpacity onPress={tryAnother} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText style={{ textAlign: "center"}}>
          Try another
          {gamificationOn ? " (no XP)" : ""}
        </AppText>

      </TouchableOpacity>

      <TouchableOpacity onPress={onComplete} style={{ backgroundColor: colors.buttonActive, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText style={{textAlign: "center", color: "#fff", fontWeight: "bold" }}>Completed</AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)/RandomHomeScreen")} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10 }}>
        <AppText style={{ textAlign: "center", fontWeight: "bold" }}>Go back</AppText>
      </TouchableOpacity>
    </View>
  );
}


