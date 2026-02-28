import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useGoalStore } from "../../app/stores/useGoalStore";
import AppText from "../../components/AppText";
import { colors, spacing, radius } from "../../constants/theme";
import FormErrorModal from "../../components/FormErrorModal";
import { confirmDelete } from "../../components/confirmDelete";

export type GoalFormScreenProps = {
  editingId?: number;
};

export default function GoalFormScreen({ editingId }: GoalFormScreenProps) {
  const router = useRouter();

  const {
    periods,
    loadPeriods,
    getGoalById,
    loadDifficulties,
    createGoal,
    saveGoal,
    deleteGoal,
    addStep,
    deleteStep,
    updateStep
  } = useGoalStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [why, setWhy] = useState("");
  const [floorGoal, setFloorGoal] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [ceilingGoal, setCeilingGoal] = useState("");
  const [period, setPeriod] = useState<number | null>(null);
  const [difficultyId, setDifficultyId] = useState<number | null>(null);
  const [availableDifficulties, setAvailableDifficulties] = useState<any[]>([]);
  const [selectedPeriodObj, setSelectedPeriodObj] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [steps, setSteps] = useState<any[]>([]);
  const [newStepTitle, setNewStepTitle] = useState("");

  const [showHelpers, setShowHelpers] = useState(false);

  useEffect(() => {
    loadPeriods();

    const loadMeta = async () => {
      const diffs = await loadDifficulties();
      setAvailableDifficulties(diffs);
    };

    loadMeta();
  }, []);

  useEffect(() => {
    if (!editingId) return;

    const load = async () => {
      setLoading(true);
      const g = await getGoalById(editingId);

      if (!g) {
        setErrorMessage("Failed to load goal");
      } else {
        setTitle(g.title);
        setDescription(g.description);
        setWhy(g.motivation_reason || "");
        setFloorGoal(g.floor_goal || "");
        setTargetGoal(g.target_goal || "");
        setCeilingGoal(g.ceiling_goal || "");
        setPeriod(g.period?.id || null);
        setSelectedPeriodObj(g.period || null);
        setDifficultyId(g.difficulty?.id || null);
        setSteps(g.steps || []);
      }

      setLoading(false);
    };

    load();
  }, [editingId]);

  useEffect(() => {
    if (!period && editingId && periods.length > 0) {
      const g = periods.find((x) => x.id === selectedPeriodObj?.id);
      if (g) setPeriod(g.id);
    }
  }, [periods]);

  const save = async () => {
    if (!title.trim()) {
      setErrorMessage("Please enter goal name");
      return;
    }
    if (!difficultyId) {
      setErrorMessage("Please select difficulty");
      return;
    }
    if (!why.trim()) {
      setErrorMessage("Please enter Why it's important");
      return;
    }
    if (!period) {
      setErrorMessage("Please select a period");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description,
      motivation_reason: why,
      period_id: period,
      difficulty_id: difficultyId,
      floor_goal: floorGoal,
      target_goal: targetGoal,
      ceiling_goal: ceilingGoal,
    };

    try {
      if (editingId) {
        await saveGoal(editingId, payload);
      } else {
        await createGoal(payload);
      }
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to save goal"
      );
    }
    finally {
      setLoading(false);
    }
  };

  const deleteGoalHandler = async () => {
    if (!editingId) return;

    setLoading(true);
    try {
      await deleteGoal(editingId);
      router.back();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.detail || "Failed to delete goal"
      );
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: spacing.m, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <AppText style={{ marginBottom: 6 }}>Name:</AppText>
        <TextInput
          value={title}
          onChangeText={setTitle}
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

        <AppText style={{ marginBottom: 6 }}>Description:</AppText>
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
            minHeight: 90,
          }}
        />

        <AppText style={{ marginBottom: 6 }}>Why it's important:</AppText>
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
            minHeight: 80,
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
              "How will this help me grow?",
              "What will I strengthen in myself? ", 
              "What skills will I develop?",
              "In which area of my life will this support me?",
              "What will happen if I don't do this?",
              "How do I feel when I avoid doing this?",
              "Why is this goal so important to me?",
              "What will I gain by achieving this goal?",
              "Why didn't I achieve this goal already? what's stopping me?",
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

        <AppText style={{ marginBottom: 6 }}>Floor:</AppText>
          <TextInput
            value={floorGoal}
            onChangeText={setFloorGoal}
            placeholder="Optional"
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

          <AppText style={{ marginBottom: 6 }}>Target:</AppText>
          <TextInput
            value={targetGoal}
            onChangeText={setTargetGoal}
            placeholder="Optional"
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

          <AppText style={{ marginBottom: 6 }}>Ceiling:</AppText>
          <TextInput
            value={ceilingGoal}
            onChangeText={setCeilingGoal}
            placeholder="Optional"
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

        <AppText style={{ marginBottom: 6 }}>Period:</AppText>
        <View style={{ flexDirection: "row", marginBottom: spacing.m }}>
          {periods.map((p: any) => (
            <TouchableOpacity
              key={p.id}
              disabled={loading}
              onPress={() => setPeriod(p.id)}
              style={{
                padding: spacing.s,
                borderRadius: radius.md,
                marginRight: spacing.s,
                backgroundColor:
                  period === p.id ? colors.buttonActive : colors.button,
              }}
            >
              <AppText>{p.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <AppText style={{ marginBottom: 6 }}>Difficulty:</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.m }}>
          {availableDifficulties.map((d) => (
            <TouchableOpacity
              key={d.id}
              disabled={loading}
              onPress={() => setDifficultyId(d.id)}
              style={{
                padding: spacing.s,
                borderRadius: radius.md,
                marginRight: spacing.s,
                marginBottom: spacing.s,
                backgroundColor:
                  difficultyId === d.id ? colors.buttonActive : colors.button,
              }}
            >
              <AppText>{d.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

{editingId && (
  <>
    <AppText style={{ marginBottom: 6 }}>Steps:</AppText>

    {steps.map((step, index) => (
      <View
        key={step.id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <TextInput
          value={step.title}
          onChangeText={(text) => {
            const updated = [...steps];
            updated[index].title = text;
            setSteps(updated);
          }}
          onBlur={async () => {
            await updateStep(step.id, step.title);
          }}
          placeholderTextColor="#7a7891"
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            padding: 6,
            borderRadius: radius.md,
            color: colors.text,
            fontSize: 13,   // 🔤 mniejsza czcionka
          }}
        />

        <TouchableOpacity
          onPress={async () => {
            await deleteStep(step.id);
            setSteps(prev => prev.filter(s => s.id !== step.id));
          }}
          style={{
            marginLeft: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.md,
            backgroundColor: colors.deleteButton,
          }}
        >
          <AppText style={{ color: "#fff", fontSize: 12 }}>×</AppText>
        </TouchableOpacity>
      </View>
    ))}

    {/* ADD STEP */}
    <View style={{ flexDirection: "row", marginTop: 8, marginBottom: 16 }}>
      <TextInput
        value={newStepTitle}
        onChangeText={setNewStepTitle}
        placeholder="Add step..."
        placeholderTextColor="#7a7891"
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          padding: 6,
          borderRadius: radius.md,
          color: colors.text,
          fontSize: 13,
        }}
      />

      <TouchableOpacity
        onPress={async () => {
          if (!newStepTitle.trim()) return;

          const created = await addStep(editingId, newStepTitle.trim());

          if (created) {
            setSteps(prev => [...prev, created]);
          }

          setNewStepTitle("");
        }}
        style={{
          marginLeft: 6,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: colors.buttonActive,
          justifyContent: "center",
          borderRadius: radius.md,
        }}
      >
        <AppText style={{ color: "#fff", fontSize: 12 }}>+</AppText>
      </TouchableOpacity>
    </View>
  </>
)}

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
              {editingId ? "Save" : "Add goal"}
            </AppText>
          )}
        </TouchableOpacity>

        {editingId && (
          <TouchableOpacity
            disabled={loading}
            onPress={() =>
              confirmDelete({
                title: "Delete goal?",
                message: "This goal will be permanently removed.",
                onConfirm: deleteGoalHandler,
              })
            }
            style={{
              backgroundColor: colors.deleteButton,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
              marginBottom: spacing.l,
            }}
          >
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              Delete goal
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
