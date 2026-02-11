import { View, TouchableOpacity, ScrollView } from "react-native";
import { useEffect } from "react";
import { useMoodStore } from "../stores/useMoodStore";
import { colors, spacing } from "../../constants/theme";
import FloatingButton from "../../components/FloatingButton";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";

const CELL_SIZE = 18;
const CELL_MARGIN = 2;
const DAY_LABEL_WIDTH = 28;
const HEADER_HEIGHT = 40;

const moodColors = {
  great: "#F9A44A",
  good: "#77C092",
  neutral: "#A678B6",
  bad: "#7795B9",
  terrible: "#949DA2",
};

const monthShort = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function MoodScreen() {
  const { entries, fetchYear } = useMoodStore();
  const router = useRouter();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchYear(year);
  }, []);

  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <ScrollView horizontal>
          <View style={{ padding: spacing.m }}>
{/* HEADER */}
<View style={{ flexDirection: "row", height: 60 }}>
  <View style={{ width: DAY_LABEL_WIDTH }} />

  {monthShort.map((m) => (
    <View
      key={m}
      style={{
        width: CELL_SIZE + CELL_MARGIN * 2,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {m.split("").map((letter, i) => (
        <AppText
          key={i}
          style={{
            fontSize: 9,
            lineHeight: 10,
          }}
        >
          {letter}
        </AppText>
      ))}
    </View>
  ))}
</View>

            {/* GRID */}
            {[...Array(31)].map((_, dayIndex) => {
              const day = dayIndex + 1;

              return (
                <View
                  key={day}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  {/* DAY LABEL */}
                  <View
                    style={{
                      width: DAY_LABEL_WIDTH,
                      alignItems: "flex-end",
                      paddingRight: 4,
                    }}
                  >
                    <AppText style={{ fontSize: 10 }}>
                      {day}
                    </AppText>
                  </View>

                  {monthShort.map((_, monthIndex) => {
                    if (day > daysInMonth(year, monthIndex)) {
                      return (
                        <View
                          key={monthIndex}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            margin: CELL_MARGIN,
                          }}
                        />
                      );
                    }

                    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const entry = entries.find(
                      (e) => e.date === dateStr
                    );

                    return (
                      <TouchableOpacity
                        key={monthIndex}
                        onPress={() =>
                          entry
                            ? router.push(`/editMood/${entry.id}`)
                            : router.push({
                                pathname: "/addMood",
                                params: { date: dateStr },
                              })
                        }
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          margin: CELL_MARGIN,
                          borderRadius: 3,
                          backgroundColor: entry
                            ? moodColors[entry.mood]
                            : colors.card,
                        }}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      <FloatingButton
        onPress={() => router.push("/addMood")}
      />
    </View>
  );
}