import { View, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMoodStore } from "../../app/stores/useMoodStore";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";

const moodColors = {
  great: "#9487b9",
  good: "#87b987",
  neutral: "#adadad",
  bad: "#87adb9",
  terrible: "#b98787",
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function MoodDayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { entries } = useMoodStore();

  const entry = entries.find(e => e.id === Number(id));

  if (!entry) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppText style={{ color: "#777" }}>
          No mood entry found
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.l,
        paddingBottom: 40,
      }}
    >

{/* ===== DATE HEADER ===== */}

<View
  style={{
    alignItems: "center",
    marginBottom: spacing.l,
  }}
>
  <AppText
    style={{
      fontSize: 15,
      color: "#888",          // subtelny kolor
      letterSpacing: 0.3,     // poprawia czytelność
    }}
  >
    {formatDate(entry.date)} · {entry.time.slice(0, 5)}
  </AppText>
</View>

      {/* ================= MOOD HERO ================= */}

      <View
        style={{
          backgroundColor: moodColors[entry.mood],
          paddingVertical: 28,
          borderRadius: radius.lg,
          alignItems: "center",
          marginBottom: spacing.l,
        }}
      >
        <AppText
          style={{
            fontSize: 14,
            opacity: 0.7,
            marginBottom: 6,
          }}
        >
          Mood
        </AppText>

<AppText
  style={{
    fontSize: 28,
    fontWeight: "800",
    textTransform: "capitalize",
    lineHeight: 24,          // prevents clipping
    includeFontPadding: false, // android fix
  }}
>
  {entry.mood}
</AppText>
      </View>


      {/* ================= NOTE ================= */}

      {entry.note ? (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 18,
            borderRadius: radius.lg,
            marginBottom: spacing.l,
          }}
        >
          <AppText
            style={{
              color: "#888",
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            Note
          </AppText>

          <AppText style={{ lineHeight: 22 }}>
            {entry.note}
          </AppText>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.card,
            padding: 18,
            borderRadius: radius.lg,
            marginBottom: spacing.l,
            alignItems: "center",
          }}
        >
          <AppText style={{ color: "#777" }}>
            No note for this day
          </AppText>
        </View>
      )}

      {/* ================= EDIT BUTTON ================= */}

      <TouchableOpacity
        onPress={() => router.push(`/editMood/${entry.id}`)}
        style={{
          paddingVertical: 16,
          backgroundColor: colors.buttonActive,
          borderRadius: radius.lg,
          alignItems: "center",
        }}
      >
        <AppText style={{ fontWeight: "700" }}>
          Edit entry
        </AppText>
      </TouchableOpacity>

    </ScrollView>
  );
}