import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useChallengeStore } from "../stores/useChallengeStore";

export default function RandomHomeScreen() {
  const router = useRouter();
  const { fetchActive, activeDaily, activeWeekly } = useChallengeStore();
  const [loading, setLoading] = useState(false);
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
      <TouchableOpacity onPress={handleDaily} style={{ backgroundColor: colors.buttonActive, padding:18, borderRadius:12, marginBottom:12 }}>
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>Randomize a daily challenge</AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleWeekly} style={{ backgroundColor: colors.buttonActive, padding:18, borderRadius:12, marginBottom:12 }}>
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>Randomize a week challenge</AppText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/random/todo")} style={{ backgroundColor: colors.buttonActive, padding:18, borderRadius:12 }}>
        <AppText style={{ color:"#fff", fontWeight:"bold", textAlign: "center" }}>Randomize a todo</AppText>
      </TouchableOpacity>
    </View>
  );
}
