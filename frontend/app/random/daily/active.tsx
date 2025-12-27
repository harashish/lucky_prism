import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useModuleSettingsStore } from "../../stores/useModuleSettingsStore";
import { useGamificationStore } from "../../stores/useGamificationStore";

export default function DailyActiveScreen() {
  const router = useRouter();
  const { fetchActive, activeDaily, discardUserChallenge, completeUserChallenge } = useChallengeStore();
  const [loading, setLoading] = useState(true);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  useEffect(() => {
    const load = async () => {
      await fetchActive();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading && !activeDaily) {
      router.replace("/random/daily");
    }
  }, [loading, activeDaily]);

  const tryAnother = async () => {
    try {
      await discardUserChallenge(activeDaily!.id);
      router.replace("/random/daily");
    } catch {
      Alert.alert("Error", "Could not discard the challenge");
    }
  };

  const onComplete = async () => {
    if (!activeDaily) return;
    const res = await completeUserChallenge(activeDaily.id);
    if (!res) return Alert.alert("Error", "Cannot complete the challenge");

    if (gamificationOn) {
      useGamificationStore.getState().applyXpResult(res);
    }

    router.replace("/(tabs)/RandomHomeScreen");
  };

  if (loading) {
  return <ActivityIndicator />
  }

  if (!activeDaily) {
    return null;
  }

  const challenge = activeDaily.challenge;

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: "center" }}>
      <AppText style={{ fontWeight: "bold", fontSize: 14, marginBottom: 12, color: colors.light, fontStyle: "italic" }}>
        You have an active daily challenge!
      </AppText>
      
      <AppText style={{ fontSize: 20, fontWeight: "700", marginBottom: 6, lineHeight: 24, paddingBottom: 2 }}>
        {challenge?.title}
      </AppText>
      
      <AppText style={{ marginBottom: 18, marginTop: 5 }}>
        {challenge?.description}
      </AppText>

      <TouchableOpacity onPress={tryAnother} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText style={{ textAlign: "center"}}>
          Try another
          {gamificationOn ? " (no XP)" : ""}
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={onComplete} style={{ backgroundColor: colors.buttonActive, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText style={{ textAlign: "center", color: "#fff", fontWeight: "bold" }}>Completed</AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)/RandomHomeScreen")} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10 }}>
        <AppText style={{ textAlign: "center", fontWeight: "bold" }}>Go back</AppText>
      </TouchableOpacity>
    </View>
  );
}
