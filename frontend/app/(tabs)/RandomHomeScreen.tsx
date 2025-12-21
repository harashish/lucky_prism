import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useChallengeStore } from "../stores/useChallengeStore";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";


export default function RandomHomeScreen() {
  const router = useRouter();
  const { fetchActive, activeDaily, activeWeekly } = useChallengeStore();
  const [loading, setLoading] = useState(false);
  const { modules } = useModuleSettingsStore();

  const userId = 1;

  useEffect(() => {
    fetchActive(userId);
  }, []);

  const handleDaily = async () => {
    setLoading(true);
    await fetchActive(userId);
    const { activeDaily: latestActive } = useChallengeStore.getState();
    setLoading(false);
    router.push(latestActive ? "/random/daily/active" : "/random/daily");
  };

  const handleWeekly = async () => {
    setLoading(true);
    await fetchActive(userId);
    setLoading(false);
    router.push(activeWeekly && activeWeekly.length > 0 ? "/random/weekly/active" : "/random/weekly");
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <View style={{ flex:1, padding:16, backgroundColor: colors.background, justifyContent:"center" }}>


      <TouchableOpacity
        onPress={modules?.challenges ? handleDaily : undefined}
        style={{ backgroundColor: modules?.challenges ? colors.buttonActive : "#444", padding:18, borderRadius:12, marginBottom:12 }}
        disabled={!modules?.challenges}
      >
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>
          Randomize a daily challenge
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={modules?.challenges ? handleWeekly : undefined}
        style={{ backgroundColor: modules?.challenges ? colors.buttonActive : "#444", padding:18, borderRadius:12, marginBottom:12 }}
        disabled={!modules?.challenges}
      >
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>
          Randomize a weekly challenge
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={modules?.todos ? () => router.push("/random/todo") : undefined}
        style={{ backgroundColor: modules?.todos ? colors.buttonActive : "#444", padding:18, borderRadius:12, marginBottom:12 }}
        disabled={!modules?.todos}
      >
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>
          Randomize a todo
        </AppText>
      </TouchableOpacity>

    </View>
  );
}
