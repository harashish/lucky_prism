import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useChallengeStore } from "../../app/stores/useChallengeStore";
import AppText from "../../components/AppText";
import { colors, components } from "../../constants/theme";
import { useModuleSettingsStore } from "../../app/stores/useModuleSettingsStore";
import { useGamificationStore } from "../../app/stores/useGamificationStore";
import { ItemHeader } from "../../components/ItemHeader";
import { ItemDetails } from "../../components/ItemDetails";

type Props = {
  item: any;
  isUserChallenge: boolean;
};

export default function ChallengeItem({ item, isUserChallenge }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const {
    assignChallenge,
    completeUserChallenge,
    fetchActive,
  } = useChallengeStore();

  const onAssign = async () => {
    const res = await assignChallenge(item.id);
    if (!res) {
      Alert.alert("Error", "Cannot assign challenge.");
    }
    await fetchActive();
  };

  const onComplete = async () => {
    const res = await completeUserChallenge(item.id);

    if (!res) {
      Alert.alert("Error", "Cannot complete challenge.");
      return;
    }

    if (gamificationOn && res.xp_gained > 0) {
      useGamificationStore.getState().applyXpResult(res);
    }

    await fetchActive();
  };

  const isWeekly =
    isUserChallenge &&
    item.challenge_type === "weekly";

  const days = isWeekly ? (item.progress_days || 1) : 0;


return (
  <TouchableOpacity
    onPress={() => setExpanded(prev => !prev)}
    onLongPress={() => router.push(`/editChallenge/${item.challenge.id}`)}
    delayLongPress={300}
  >
    <View style={components.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ItemHeader
          title={isUserChallenge ? item.challenge.title : item.title}
          difficulty={
            isUserChallenge
              ? item.challenge.difficulty?.name
              : item.difficulty?.name
          }
        />

        <View style={{ flexDirection: "row", gap: 8 }}>
          {!isUserChallenge && (
            <TouchableOpacity onPress={onAssign} style={components.addButton}>
              <AppText style={{ color: "#fff", fontSize: 18 }}>+</AppText>
            </TouchableOpacity>
          )}

        {isUserChallenge && (
          <TouchableOpacity onPress={onComplete} style={components.completeButton}>
            <AppText style={{ color: "#fff", fontSize: 14 }}>
              Complete
            </AppText>
          </TouchableOpacity>
        )}

        </View>
      </View>

      {isWeekly && (
        <>
          <View
            style={{
              height: 8,
              backgroundColor: colors.light,
              borderRadius: 4,
              marginVertical: 8,
            }}
          >
            <View
              style={{
                width: `${(days / 7) * 100}%`,
                height: 8,
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
          description={
            isUserChallenge
              ? item.challenge.description
              : item.description
          }
        />
      )}
    </View>
  </TouchableOpacity>
);
}
