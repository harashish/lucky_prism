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
  item: any; // Challenge OR UserChallenge – zgodnie z nowym screenem
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

  /* ---------- ACTIONS ---------- */

  const onAssign = async () => {
    const res = await assignChallenge(item.id);
    if (!res) {
      Alert.alert("Error", "Cannot assign challenge.");
    }
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

  /* ---------- WEEKLY PROGRESS ---------- */

  const days =
    isUserChallenge && item.challenge_type?.name === "weekly"
      ? item.progress_days ?? 1
      : null;

  /* ---------- RENDER ---------- */

  return (
    <TouchableOpacity
      onPress={() => setExpanded((prev) => !prev)}
      onLongPress={() => router.push(`/editChallenge/${item.id}`)}
      delayLongPress={300}
    >
      <View style={components.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ItemHeader
            title={isUserChallenge ? item.challenge.title : item.title}
            difficulty={
              isUserChallenge
                ? item.challenge.difficulty?.name
                : item.difficulty?.name
            }
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 8,
              flexShrink: 0,
              gap: 8,
            }}
          >
            {!isUserChallenge && (
              <TouchableOpacity onPress={onAssign} style={components.addButton}>
                <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
              </TouchableOpacity>
            )}

            {isUserChallenge && (
              <TouchableOpacity
                onPress={onComplete}
                style={components.completeButton}
              >
                <AppText style={{ color: "#fff", fontSize: 14 }}>
                  Complete
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Weekly progress bar */}
        {isUserChallenge && days != null && (
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
