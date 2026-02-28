import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import { useChallengeStore } from "../stores/useChallengeStore";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";

export default function RandomScreen() {
  const router = useRouter();

  const { activeDaily, activeWeekly } = useChallengeStore();
  const { modules } = useModuleSettingsStore();

  const handleDaily = () => {
    router.push(
      activeDaily ? "/random/daily/active" : "/random/daily"
    );
  };

  const handleWeekly = () => {
    router.push(
      activeWeekly.length > 0
        ? "/random/weekly/active"
        : "/random/weekly"
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
        justifyContent: "center",
      }}
    >
      <TouchableOpacity
        onPress={modules?.challenges ? handleDaily : undefined}
        style={{
          backgroundColor: modules?.challenges
            ? colors.buttonActive
            : "#444",
          padding: 18,
          borderRadius: 12,
          marginBottom: 12,
        }}
        disabled={!modules?.challenges}
      >
        <AppText
          style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
        >
          Randomize a daily challenge
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={modules?.challenges ? handleWeekly : undefined}
        style={{
          backgroundColor: modules?.challenges
            ? colors.buttonActive
            : "#444",
          padding: 18,
          borderRadius: 12,
          marginBottom: 12,
        }}
        disabled={!modules?.challenges}
      >
        <AppText
          style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
        >
          Randomize a weekly challenge
        </AppText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={modules?.todos ? () => router.push("/random/todo") : undefined}
        style={{
          backgroundColor: modules?.todos
            ? colors.buttonActive
            : "#444",
          padding: 18,
          borderRadius: 12,
          marginBottom: 12,
        }}
        disabled={!modules?.todos}
      >
        <AppText
          style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
        >
          Randomize a todo
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
