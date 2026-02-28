import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSobrietyStore } from "../../app/stores/useSobrietyStore";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type Props = {
  editingId?: number;
};

export default function SobrietyFormScreen({ editingId }: Props) {
  const router = useRouter();

  const {
    getSobrietyById,
    createSobriety,
    updateSobriety,
    deleteSobriety,
  } = useSobrietyStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [startedAt, setStartedAt] = useState(new Date());
  const [showHelpers, setShowHelpers] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: startedAt,
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          // po wyborze daty otwieramy time picker
          openTimePicker(selectedDate);
        }
      },
    });
  };

  const openTimePicker = (selectedDate: Date) => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: "time",
      is24Hour: true,
      onChange: (event, selectedTime) => {
        if (event.type === "set" && selectedTime) {
          const finalDate = new Date(selectedDate);
          finalDate.setHours(selectedTime.getHours());
          finalDate.setMinutes(selectedTime.getMinutes());
          setStartedAt(finalDate);
        }
      },
    });
  };

  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const s = await getSobrietyById(editingId);

      if (!s) {
        setErrorMessage("Failed to load sobriety");
      } else {
        setName(s.name);
        setDescription(s.description || "");
        setWhy(s.motivation_reason);
        setStartedAt(new Date(s.started_at));
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  const save = async () => {
    if (!name.trim()) {
      setErrorMessage("Please enter name");
      return;
    }

    if (!why.trim()) {
      setErrorMessage("Please enter motivation");
      return;
    }

    if (startedAt > new Date()) {
      setErrorMessage("Start date cannot be in the future");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      description,
      motivation_reason: why,
      started_at: startedAt.toISOString(),
    };

    try {
      if (editingId) {
        await updateSobriety(editingId, payload);
      } else {
        await createSobriety(payload);
      }

      router.back();
    } catch {
      setErrorMessage("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    await deleteSobriety(editingId);
    router.back();
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Description (optional):</AppText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
            minHeight: 80,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Why is this important?</AppText>
        <TextInput
          value={why}
          onChangeText={setWhy}
          multiline
          placeholderTextColor="#7a7891"
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            color: colors.text,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
            minHeight: 90,
          }}
        />

        {/* HELPER QUESTIONS TOGGLE */}
        <TouchableOpacity
          onPress={() => setShowHelpers(prev => !prev)}
          style={{ marginBottom: 6 }}
        >
          <AppText
            style={{
              fontSize: 12,
              color: "#777",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            helper questions
          </AppText>
        </TouchableOpacity>

        {showHelpers && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.md,
              padding: 10,
              marginBottom: spacing.m,
            }}
          >
            {[
              "What triggers this habit most often?",
              "In which situations do I feel the strongest urge?",
              "What emotion am I trying to escape?",
              "What will improve in my life if I stay sober?",
              "How do I actually feel after relapse?",
              "What pattern keeps repeating?",
              "What would my stronger version of me do instead?",
              "What need is hidden behind this habit?",
              "What will I gain in 30 / 90 / 365 days?",
            ].map((q, i) => (
              <AppText
                key={i}
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 6,
                }}
              >
                - {q}
              </AppText>
            ))}
          </View>
        )}

        <AppText style={{ marginBottom: 6 }}>Start date:</AppText>
        <TouchableOpacity
          onPress={openDatePicker}
          style={{
            borderWidth: 1,
            borderColor: colors.inputBorder,
            padding: spacing.s,
            borderRadius: radius.md,
            marginBottom: spacing.m,
          }}
        >
          <AppText>
            {startedAt.toLocaleString()}
          </AppText>
        </TouchableOpacity>


        <TouchableOpacity
          onPress={save}
          disabled={loading}
          style={{
            backgroundColor: colors.buttonActive,
            padding: spacing.m,
            borderRadius: radius.md,
            alignItems: "center",
            marginBottom: editingId ? spacing.m : 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              {editingId ? "Save" : "Start"}
            </AppText>
          )}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete sobriety?",
                message: "This will remove the tracker permanently.",
                onConfirm: deleteHandler,
              })
            }
            style={{
              backgroundColor: colors.deleteButton,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              Delete
            </AppText>
          </TouchableOpacity>
        )}
      </ScrollView>

      <FormErrorModal
        visible={!!errorMessage}
        message={errorMessage || ""}
        onClose={() => setErrorMessage(null)}
      />
    </>
  );
}