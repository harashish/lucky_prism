import React, { useEffect, useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { colors, components } from "../../constants/theme";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useSobrietyStore } from "../../app/stores/useSobrietyStore";

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

  const diffMs = end.diff(start);
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

  return (
    <TouchableOpacity onPress={onToggleExpand} onLongPress={onEdit}>
      <View style={{ ...components.container }}>

        {/* NAME */}
        <AppText style={{ fontWeight: "bold", marginBottom: 6 }}>
          {item.name}
        </AppText>

        {/* TIMER CENTERED */}
        <View style={{ alignItems: "center", marginVertical: 6 }}>
          <AppText
            style={{
              fontSize: 26,
              fontWeight: "600",
              color: item.is_active ? colors.buttonActive : "#777",
              textAlign: "center",
            }}
          >
            {formatted}
          </AppText>
        </View>

        {!item.is_active && (
          <AppText style={{ fontSize: 12, color: "#777", textAlign: "center" }}>
            ended
          </AppText>
        )}

        {isExpanded && (
          <View style={{ marginTop: 12 }}>

{/* PROGRESS BAR */}
<AppText style={{ fontSize: 12, marginBottom: 4 }}>
   target {currentMilestone} days
</AppText>

<View
  style={{
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 4,
    marginBottom: 8,
  }}
>
  <View
    style={{
      height: 6,
      width: `${progressPercent}%`,
      backgroundColor: colors.buttonActive,
    }}
  />
</View>

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
                onPress={() => relapse(item.id)}
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