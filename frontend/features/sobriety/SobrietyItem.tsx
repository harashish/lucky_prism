import React, { useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { colors, components } from "../../constants/theme";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSobrietyStore } from "../../app/stores/useSobrietyStore";
import { Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

dayjs.extend(duration);

type Props = {
  item: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
};

const milestones = [
  1,
  7,
  30,
  90,
  180,
  365,
  730,
]; // dni


export default function SobrietyItem({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
}: Props) {
  const { relapse, restart, updateSobriety } = useSobrietyStore();

  const [now, setNow] = useState(dayjs());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { formatted, totalDays } = useMemo(() => {
    
  const start = dayjs(item.started_at);
  const end = item.is_active ? now : dayjs(item.ended_at);

  const diffMs = Math.max(0, end.diff(start));
  const diff = dayjs.duration(diffMs);

  const days = Math.floor(diff.asDays());
  const hours = diff.hours();
  const minutes = diff.minutes();
  const seconds = diff.seconds();


  let formatted = "";

  if (days > 0) formatted += `${days}d `;
  if (hours > 0 || days > 0) formatted += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0)
    formatted += `${minutes}m `;
  formatted += `${seconds}s`;

  return {
    formatted: formatted.trim(),
    totalDays: diff.asDays(),
  };
}, [now, item.started_at, item.is_active, item.ended_at]);

const currentMilestone = useMemo(() => {
  for (let i = 0; i < milestones.length; i++) {
    if (totalDays < milestones[i]) {
      return milestones[i];
    }
  }

  // jeśli > 2 lata → kolejny pełny rok
  const years = Math.floor(totalDays / 365);
  return (years + 1) * 365;
}, [totalDays]);

const progressPercent = useMemo(() => {
  return Math.min((totalDays / currentMilestone) * 100, 100);
}, [totalDays, currentMilestone]);

  const confirmRelapse = (id: number) => {
  Alert.alert(
    "End sobriety?",
    "This will reset your streak.",
    [
      { text: "Cancel" },
      { text: "Relapse", onPress: () => relapse(id) },
    ]
  );
};

  return (
    <TouchableOpacity onPress={onToggleExpand} onLongPress={onEdit}>
      <View style={{ ...components.container }}>

        {/* NAME */}
        <AppText
          style={{
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          free from {item.name}
        </AppText>

        {/* TIMER CENTERED */}
        <View style={{ alignItems: "center", marginVertical: 6 }}>
          <AppText
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: item.is_active ? colors.buttonActive : "#777",
              textAlign: "center",
            }}
          >
            {formatted}
          </AppText>
        </View>

        {/* PROGRESS BAR */}

<View style={{ marginTop: 10, marginBottom: 6 }}>
  <View
    style={{
      height: 12,
      backgroundColor: "#eee",
      borderRadius: 6,
      overflow: "hidden",
    }}
  >
    <LinearGradient
  colors={[colors.buttonActive, "#7be0ff"]}
  style={{
    width: `${Math.min(progressPercent, 100)}%`,
    height: 12,
  }}
/>
  </View>

  <AppText
    style={{
      fontSize: 12,
      color: "#777",
      textAlign: "center",
      marginTop: 6,
    }}
  >
    {Math.floor(totalDays)} / {currentMilestone} days
  </AppText>
</View>

        {!item.is_active && (
          <AppText style={{ fontSize: 12, color: "#777", textAlign: "center" }}>
            ended {dayjs(item.ended_at).format("DD MMM YYYY")}
          </AppText>
        )}

        {isExpanded && (
          <View style={{ marginTop: 12 }}>


            {/* MOTIVATION */}
            {item.description ? (
              <AppText style={{ fontSize: 12, color: "#aaa" }}>
                {item.description}
              </AppText>
            ) : null}

            <AppText style={{ fontSize: 12, marginTop: 6 }}>
              {item.motivation_reason}
            </AppText>

            {/* BUTTONS */}
            <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>

            {/* RELAPSE / RESET */}
            {item.is_active ? (
              <TouchableOpacity
                onPress={() => confirmRelapse(item.id)}
                style={{
                  backgroundColor: colors.deleteButton,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <AppText style={{ color: "#fff", fontSize: 12 }}>
                  relapse
                </AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => restart(item.id)}
                style={{
                  backgroundColor: colors.buttonActive,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <AppText style={{ color: "#fff", fontSize: 12 }}>
                  restart
                </AppText>
              </TouchableOpacity>
            )}

              {/* +1H TEST */}
              <TouchableOpacity
                onPress={() =>
                  updateSobriety(item.id, {
                    started_at: dayjs(item.started_at)
                      .subtract(1, "hour")
                      .toISOString(),
                  })
                }
                style={{
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <AppText style={{ fontSize: 12 }}>+1h</AppText>
              </TouchableOpacity>

              {/* +24H TEST */}
              <TouchableOpacity
                onPress={() =>
                  updateSobriety(item.id, {
                    started_at: dayjs(item.started_at)
                      .subtract(24, "hour")
                      .toISOString(),
                  })
                }
                style={{
                  backgroundColor: colors.card,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                }}
              >
                <AppText style={{ fontSize: 12 }}>+24h</AppText>
              </TouchableOpacity>

            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}