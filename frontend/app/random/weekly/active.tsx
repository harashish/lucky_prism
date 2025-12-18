import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useModuleSettingsStore } from "../../stores/useModuleSettingsStore";

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

  const uc = activeWeekly[0]; // pierwszy aktywny
  const ch = uc.challenge;
  const progress = uc.progress_percent ?? 0;

  const onSpróbujInny = async () => {
    const ok = await discardUserChallenge(uc.id);
    if (!ok) return Alert.alert("Błąd", "Nie udało się odrzucić challenge'a");

    await fetchActive(userId);
    const { activeWeekly: latestActive } = useChallengeStore.getState();
    router.replace(latestActive && latestActive.length > 0 ? "/random/weekly/active" : "/random/weekly");
  };

  const onWykonano = async () => {
    const res = await completeUserChallenge(uc.id);
    if (!res) return Alert.alert("Błąd", "Nie udało się ukończyć");

    if (gamificationOn) {
      Alert.alert("Done", ` +${res.total_xp} XP`);
    }


    await fetchActive(userId);
    router.replace("/(tabs)/RandomHomeScreen");
  };

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: "center" }}>
      <AppText style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>Aktywny challenge tygodniowy</AppText>
      <AppText style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>{ch?.title}</AppText>
      <AppText style={{ marginBottom: 12 }}>{ch?.description}</AppText>

      <View style={{ height: 10, backgroundColor: colors.card, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
        <View style={{ width: `${Math.round(progress)}%`, height: 10, backgroundColor: colors.buttonActive }} />
      </View>
      <AppText style={{ marginBottom: 10 }}>{progress}% ukończenia</AppText>

      <TouchableOpacity onPress={onSpróbujInny} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText>
          Spróbuj inny
          {gamificationOn ? " (brak XP)" : ""}
        </AppText>

      </TouchableOpacity>

      <TouchableOpacity onPress={onWykonano} style={{ backgroundColor: colors.buttonActive, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText style={{ color: "#fff", fontWeight: "bold" }}>Wykonano</AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)/RandomHomeScreen")} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10 }}>
        <AppText style={{ textAlign: "center", fontWeight: "bold" }}>Wróć</AppText>
      </TouchableOpacity>
    </View>
  );
}
