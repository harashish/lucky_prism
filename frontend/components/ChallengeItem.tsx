// frontend/components/ChallengeItem.tsx

import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useChallengeStore, ChallengeWithUserInfo } from "../app/stores/useChallengeStore";
import { useGamificationStore } from "../app/stores/useGamificationStore";
import AppText from "../components/AppText";
import { colors, components, spacing } from "../constants/theme";
import { api } from "../app/api/apiClient";
import { useModuleSettingsStore } from "../app/stores/useModuleSettingsStore";

type Props = {
  item: ChallengeWithUserInfo;
  userId?: number;
  alreadyAssigned?: boolean;
  onAssigned?: () => void;
};

export default function ChallengeItem({
  item,
  userId,
  alreadyAssigned,
  onAssigned,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [localProgress] = useState<number | null>(item.progress_percent ?? null);

  const { modules } = useModuleSettingsStore();
  const gamificationOn = modules?.gamification;

  const assignChallenge = async () => {
    if (!userId) return;
    try {
      await api.post("/challenges/assign/", { user: userId, challenge: item.id });
      onAssigned?.();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      if (detail?.includes("already exists")) {
        Alert.alert("Błąd", detail);
      } else {
        Alert.alert("Błąd", "Nie udało się przypisać challenge.");
      }
    }
  };

  const completeChallenge = async () => {
    if (!item.userChallengeId) return;

    try {
      const res = await useChallengeStore
        .getState()
        .completeUserChallenge(item.userChallengeId);

      if (res && gamificationOn && res.xp_gained > 0) {
        useGamificationStore.getState().applyXpResult(res);
      }

      onAssigned?.();
    } catch {
      Alert.alert("Błąd", "Nie udało się ukończyć challenge.");
    }
  };

  const localDays =
    item.challenge_type === "Weekly" && localProgress != null
      ? Math.round((localProgress / 100) * 7)
      : null;

  return (
    <TouchableOpacity
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/editChallenge/${item.id}`)}
      delayLongPress={300}
    >
      <View style={components.container}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontWeight: "bold" }}>{item.title}</AppText>
            <AppText style={{ fontSize: 12, color: "#777" }}>
              {item.difficulty.name}
            </AppText>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {userId && !alreadyAssigned && (
              <TouchableOpacity onPress={assignChallenge} style={components.addButton}>
                <AppText style={{ color: "#fff" }}>＋</AppText>
              </TouchableOpacity>
            )}

            {userId && alreadyAssigned && (
              <TouchableOpacity
                onPress={completeChallenge}
                style={components.completeButton}
              >
                <AppText style={{ color: "#fff" }}>Ukończ</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {alreadyAssigned && localDays != null && item.challenge_type === "Weekly" && (
          <View style={{ marginTop: 8 }}>
            <View style={{ height: 8, backgroundColor: "#eee", borderRadius: 4 }}>
              <View
                style={{
                  width: `${(localDays / 7) * 100}%`,
                  height: "100%",
                  backgroundColor: colors.buttonActive,
                }}
              />
            </View>
            <AppText style={{ fontSize: 12, marginTop: 2 }}>
              {localDays}/7 dni
            </AppText>
          </View>
        )}

        {expanded && (
          <View style={{ marginTop: spacing.s }}>
            {item.description?.trim() && <AppText>{item.description}</AppText>}
            <AppText>
              Tags:{" "}
              {item.tags.length
                ? item.tags.map(t => t.name).join(", ")
                : "Brak"}
            </AppText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
