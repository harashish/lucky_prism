import React from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../AppText";
import { colors } from "../../constants/theme";

type Props = {
  activeWeekly: any[];
  onGoToActive: () => void;
  onRandomize: () => void;
  onEdit?: (challengeId: number) => void;
};

export function WeeklyChallengeTile({
  activeWeekly,
  onGoToActive,
  onRandomize,
  onEdit,
}: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <AppText style={{ fontWeight: "700", marginBottom: 8 }}>
        Week challenge
      </AppText>

      {activeWeekly && activeWeekly.length > 0 ? (
        activeWeekly.map((uc) => {
          const days = uc.progress_days ?? 0;
          const progress = Math.min(100, (days / 7) * 100);

          return (
            <TouchableOpacity
              key={uc.id}
              onPress={onGoToActive}
              onLongPress={() =>
                onEdit?.(uc.challenge.id)
              }
              style={{
                backgroundColor: colors.card,
                padding: 12,
                borderRadius: 10,
                marginBottom: 8,
              }}
            >
              <AppText style={{ fontWeight: "700" }}>
                {uc.challenge?.title}
              </AppText>

              <View
                style={{
                  height: 8,
                  backgroundColor: colors.light,
                  borderRadius: 6,
                  overflow: "hidden",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    width: `${progress}%`,
                    height: 8,
                    backgroundColor: colors.buttonActive,
                  }}
                />
              </View>

              <AppText style={{ marginTop: 6 }}>
                {days}/7 dni
              </AppText>
            </TouchableOpacity>
          );
        })
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
