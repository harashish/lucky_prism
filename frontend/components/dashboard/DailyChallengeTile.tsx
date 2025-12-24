import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  activeDaily: any | null;
  onGoToActive: () => void;
  onRandomize: () => void;
  onEdit?: (challengeId: number) => void;
};

export function DailyChallengeTile({
  activeDaily,
  onGoToActive,
  onRandomize,
  onEdit,
}: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        Daily challenge
      </AppText>

      {activeDaily ? (
        <TouchableOpacity
          onPress={onGoToActive}
          onLongPress={() =>
            onEdit?.(activeDaily.challenge.id)
          }
          style={{
            backgroundColor: colors.card,
            padding: 12,
            borderRadius: 10,
          }}
        >
          <AppText style={{ fontWeight: "700" }}>
            {activeDaily.challenge?.title}
          </AppText>
          <AppText numberOfLines={2}>
            {activeDaily.challenge?.description}
          </AppText>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onRandomize}
          style={{
            backgroundColor: colors.buttonActive,
            padding: 12,
            borderRadius: 10,
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "700" }}>
            Randomize challenge
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}
