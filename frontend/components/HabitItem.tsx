// frontend/components/HabitItem.tsx
import React, { useState } from "react";
import { View, Pressable } from "react-native";
import AppText from "./AppText";
import { colors, components, spacing } from "../constants/theme";
import { useRouter } from "expo-router";

type HabitProps = {
  item: any; // Habit
  onToggleToday: (habitId: number) => Promise<void>;
  onToggleDay: (habitId: number, date: string, newStatus: number) => Promise<void>;
};

export default function HabitItem({ item, onToggleToday, onToggleDay }: HabitProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const days = item.days || [];

  return (
    <Pressable
      onPress={() => setExpanded(prev => !prev)}
      onLongPress={() => router.push(`/editHabit/${item.id}`)}
      delayLongPress={300}
      style={({ pressed }) => [
        components.container,
        { opacity: pressed ? 0.9 : 1, marginBottom: spacing.s }
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <AppText style={{ fontWeight: "bold" }}>{item.title}</AppText>


        <Pressable
          onPress={() => onToggleToday(item.id)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: item.color || colors.buttonActive,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 18 }}>＋</AppText>
        </Pressable>

      </View>

      {expanded && (
        <View style={{ marginTop: 0 }}>
          
          {item.description ? (
            <>
              <AppText style={{ marginBottom: spacing.s }}>{item.description}</AppText>
            </>
          ) : null}

                  <AppText style={{ fontSize: 12, color: "#777" }}>
          {item.difficulty.name}
        </AppText>

          
          {item.motivation_reason ? (
          <AppText
            style={{
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 4,
            }}
          >
            Motivation: {item.motivation_reason}
          </AppText>
        ) : null}



        </View>
      )}


      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: spacing.s }}>
        {days.map((d: any) => {
          const status = d.status;
          const todayStr = new Date().toISOString().slice(0, 10);
          const isFuture = d.date > todayStr;
          const squareStyle: any = {
            width: 26,
            height: 26,
            marginRight: 6,
            marginBottom: 6,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
          };

          if (isFuture) {
            squareStyle.backgroundColor = "#2b2b35";
          } else if (status === 2) {
            squareStyle.backgroundColor = item.color || colors.buttonActive;
          } else if (status === 1) {
            squareStyle.backgroundColor = "#5a5a66";
          } else {
            squareStyle.backgroundColor = "#22222b";
            squareStyle.borderWidth = 1;
            squareStyle.borderColor = item.color || colors.inputBorder;
          }

          return (
            <Pressable
              key={d.date}
              onPress={async () => {
                const todayStr = new Date().toISOString().slice(0, 10);
                if (d.date > todayStr) {
                  return;
                }
                const newStatus = d.status === 2 ? 1 : 2;
                await onToggleDay(item.id, d.date, newStatus);
              }}
              onLongPress={() => router.push(`/editHabit/${item.id}`)}
              delayLongPress={300}
            >
              <View style={squareStyle}>
                <AppText style={{ fontSize: 10, color: "#fff" }}>
                  {new Date(d.date).getDate()}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}
