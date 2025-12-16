import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";

export default function DailyActiveScreen() {
  const router = useRouter();
  const userId = 1;
  const { fetchActive, activeDaily, discardUserChallenge, completeUserChallenge } = useChallengeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await fetchActive(userId);
      setLoading(false);
    };
    load();
  }, []);

const onSpróbujInny = async () => {
  const ok = await discardUserChallenge(activeDaily?.id!);
  if (!ok) return Alert.alert("Błąd", "Nie udało się odrzucić challenge'a");

  await fetchActive(userId);
  const { activeDaily: latestActive } = useChallengeStore.getState();
  router.push(latestActive ? "/random/daily/active" : "/random/daily");
};
const onWykonano = async () => {
  if (!activeDaily) return;
  const res = await completeUserChallenge(activeDaily.id);
  if (!res) return Alert.alert("Błąd", "Nie udało się ukończyć");

  Alert.alert("Ukończono", `Total XP: ${res.total_xp}`);

  await fetchActive(userId);
  const { activeDaily: latestActive } = useChallengeStore.getState();
  router.push("/(tabs)/RandomHomeScreen"); // albo jeśli chcesz natychmiast activeDaily, użyj latestActive
};


  if (loading || !activeDaily) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  const ch = activeDaily.challenge;

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: colors.background, justifyContent: "center" }}>
      <AppText style={{ fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>Aktywny challenge dzienny</AppText>
      <AppText style={{ fontSize: 20, fontWeight: "700", marginBottom: 6 }}>{ch?.title}</AppText>
      <AppText style={{ marginBottom: 12 }}>{ch?.description}</AppText>

      <TouchableOpacity onPress={onSpróbujInny} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <AppText>Spróbuj inny (brak XP)</AppText>
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
