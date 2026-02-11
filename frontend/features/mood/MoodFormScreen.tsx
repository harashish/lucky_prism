import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AppText from "../../components/AppText";
import { useMoodStore, MoodType } from "../../app/stores/useMoodStore";
import { colors, spacing } from "../../constants/theme";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
    editingId?: number;
    initialDate?: string;
};
const moods: MoodType[] = [
    "great",
    "good",
    "neutral",
    "bad",
    "terrible",
];

export default function MoodFormScreen({ editingId, initialDate }: Props) {
    const { entries, addMood, updateMood } = useMoodStore();
    const router = useRouter();

    const existing = entries.find((e) => e.id === editingId);

    const [date, setDate] = useState(
        existing
            ? new Date(existing.date)
            : initialDate
            ? new Date(initialDate)
            : new Date()
        );
    const [time, setTime] = useState(existing ? new Date(`1970-01-01T${existing.time}`) : new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [mood, setMood] = useState<MoodType>(
        existing?.mood || "neutral"
    );
    const [note, setNote] = useState(existing?.note || "");

    useEffect(() => {
        if (existing) {
        setMood(existing.mood);
        setNote(existing.note);
        }
    }, [existing]);

const handleSubmit = async () => {
    const formattedDate = date.toISOString().slice(0, 10);

    const existingForDate = entries.find(
        (e) => e.date === formattedDate
    );

    if (!editingId && existingForDate) {
        alert("Mood already exists for this date");
        return;
    }

    const payload = {
        mood,
        note,
        date: formattedDate,
        time: time.toTimeString().slice(0, 8),
    };

    if (editingId) {
        await updateMood(editingId, payload);
    } else {
        await addMood(payload);
    }

    router.back();
};

return (
  <ScrollView
    contentContainerStyle={{
      padding: spacing.l,
      paddingBottom: 40,
    }}
    keyboardShouldPersistTaps="handled"
  >
    <AppText style={{ fontWeight: "700", marginBottom: 12 }}>
      Select mood
    </AppText>

    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {moods.map((m) => (
        <TouchableOpacity
          key={m}
          onPress={() => setMood(m)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
            backgroundColor:
              mood === m ? colors.buttonActive : colors.card,
          }}
        >
          <AppText>{m}</AppText>
        </TouchableOpacity>
      ))}
    </View>

    {/* DATE + TIME ROW */}
    <View
      style={{
        flexDirection: "row",
        marginTop: spacing.l,
        gap: 12,
      }}
    >
      {/* DATE */}
      <View style={{ flex: 1 }}>
        <AppText>Date</AppText>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 8,
            marginTop: spacing.s,
          }}
        >
        <AppText>
        {date.toLocaleDateString("en-En", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })}
        </AppText>
        </TouchableOpacity>
      </View>

      {/* TIME */}
      <View style={{ flex: 1 }}>
        <AppText>Time</AppText>

        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={{
            backgroundColor: colors.card,
            padding: 10,
            borderRadius: 8,
            marginTop: spacing.s,
          }}
        >
          <AppText>{time.toTimeString().slice(0, 5)}</AppText>
        </TouchableOpacity>
      </View>
    </View>

    {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(e, selectedDate) => {
          setShowDatePicker(false);
          if (selectedDate) setDate(selectedDate);
        }}
      />
    )}

    {showTimePicker && (
      <DateTimePicker
        value={time}
        mode="time"
        display="default"
        onChange={(e, selectedTime) => {
          setShowTimePicker(false);
          if (selectedTime) setTime(selectedTime);
        }}
      />
    )}

    {/* NOTE */}
    <AppText style={{ marginTop: spacing.l }}>
      Optional note
    </AppText>

    <TextInput
      value={note}
      onChangeText={setNote}
      multiline
      style={{
        marginTop: spacing.s,
        backgroundColor: colors.card,
        padding: 12,
        borderRadius: 8,
        color: colors.text,
        minHeight: 120,
        textAlignVertical: "top",
      }}
    />

    <TouchableOpacity
      onPress={handleSubmit}
      style={{
        marginTop: spacing.l,
        paddingVertical: 14,
        backgroundColor: colors.buttonActive,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <AppText>Save</AppText>
    </TouchableOpacity>
  </ScrollView>
);
}