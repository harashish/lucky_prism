import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { useRouter } from "expo-router";
import { colors } from "../../../constants/theme";
import RandomSpin from "../spin";

export default function WeeklyPickScreen() {
  const router = useRouter();
  const {
    loadTags,
    tags,
    fetchRandomChallenge,
    loadDifficulties,
    difficulties,
  } = useChallengeStore();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [spinItems, setSpinItems] = useState<string[]>([]);
  const [hasAvailableChallenge, setHasAvailableChallenge] = useState<boolean | null>(null);
  
  useEffect(() => {
    loadTags();
    if (typeof loadDifficulties === "function") loadDifficulties();
  }, []);

  useEffect(() => {
    const check = async () => {
      if (selectedTags.length === 0 && selectedDifficulty === null) {
        setHasAvailableChallenge(true);
        return;
      }

      const test = await fetchRandomChallenge(
        "weekly",
        selectedTags,
        selectedDifficulty
      );

      setHasAvailableChallenge(!!test);
    };

    check();
  }, [selectedTags, selectedDifficulty]);


  const toggleTag = (id: number) =>
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const onLosuj = async () => {
    if (!tags.length) {
      Alert.alert("No tags.");
      return;
    }

    let picked = null;

    const hasTags = selectedTags.length > 0;
    const hasDifficulty = selectedDifficulty !== null;

    if (hasTags) {
      picked = await fetchRandomChallenge(
        "weekly",
        selectedTags,
        selectedDifficulty
      );

      if (!picked) {
        picked = await fetchRandomChallenge("weekly", selectedTags, null);
      }

    } else if (hasDifficulty) {
      picked = await fetchRandomChallenge("weekly", [], selectedDifficulty);
    }

    if (!picked) {
      Alert.alert(
        "No matching challenge",
        "No challenge matches the selected filters."
      );
      return;
    }

    setSpinItems(["...", "Randomizing", "Searching", "Wait", "OK"]);
    setSpinning(true);

    setTimeout(() => {
      setSpinning(false);
      router.push({
        pathname: "/random/result",
        params: {
          item: JSON.stringify(picked),
          source: "challenge",
        },
      });
    }, 600);
  };


  if (spinning)
    return (
      <RandomSpin
        items={spinItems.length ? spinItems : ["..."]}
        onFinish={() => {}}
      />
    );

  const randomDisabled = hasAvailableChallenge === false;  

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          disabled={randomDisabled}
          onPress={onLosuj}
          style={{
            backgroundColor: randomDisabled
              ? colors.card
              : colors.buttonActive,
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
            width: "80%",
            alignItems: "center",
            opacity: randomDisabled ? 0.6 : 1,
          }}
        >
          <AppText style={{ color: "#fff", fontWeight: "bold" }}>
            Randomize!
          </AppText>
        </TouchableOpacity>

        {hasAvailableChallenge === false && (
          <AppText style={{ marginBottom: 12, color: "#999" }}>
            No challenges match the selected filters
          </AppText>
        )}

        {/* TAGS */}
        <AppText style={{ marginBottom: 8 }}>Filter by tags:</AppText>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {tags.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => toggleTag(t.id)}
              style={{
                padding: 8,
                margin: 6,
                borderRadius: 8,
                backgroundColor: selectedTags.includes(t.id)
                  ? colors.buttonActive
                  : colors.card,
              }}
            >
              <AppText>{t.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* DIFFICULTY */}
        <AppText style={{ marginBottom: 8 }}>Filter by difficulty:</AppText>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          {(difficulties || []).map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() =>
                setSelectedDifficulty((prev) =>
                  prev === d.id ? null : d.id
                )
              }
              style={{
                padding: 8,
                margin: 6,
                borderRadius: 8,
                backgroundColor:
                  selectedDifficulty === d.id
                    ? colors.buttonActive
                    : colors.card,
              }}
            >
              <AppText>{d.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
