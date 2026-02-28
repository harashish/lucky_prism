import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, SectionList, ScrollView } from "react-native";
import { useChallengeStore } from "../stores/useChallengeStore";
import ChallengeItem from "../../features/challenges/ChallengeItem";
import { useFocusEffect, useRouter } from "expo-router";
import AppText from "../../components/AppText";
import { colors, radius } from "../../constants/theme";
import FloatingButton from "../../components/FloatingButton";

const ChallengesScreen = () => {
  const router = useRouter();

  const TYPES = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
  ] as const;

  const {
    challenges,
    tags,
    activeDaily,
    activeWeekly,
    selectedType,
    setSelectedType,
    loading,
    loadTags,
    loadChallenges,
    fetchActive,
  } = useChallengeStore();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

    useEffect(() => {
    loadTags();
    loadChallenges();
  }, []);


  useFocusEffect(
  useCallback(() => {
    fetchActive();
  }, [])
);

  const toggleTag = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const activeChallenges = useMemo(() => {
    if (selectedType === "daily") {
      return activeDaily ? [activeDaily] : [];
    }
    return activeWeekly;
  }, [activeDaily, activeWeekly, selectedType]);

  const activeDefinitionIds = new Set(
    activeChallenges.map((uc) => uc.challenge.id)
  );

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      if (c.type.name !== selectedType) return false;
      if (activeDefinitionIds.has(c.id)) return false;
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tid) => c.tags.some((t) => t.id === tid))
      )
        return false;
      return true;
    });
  }, [challenges, selectedType, selectedTags, activeDefinitionIds]);

  let sections: any[] = [];

  if (activeChallenges.length > 0) {
    sections.push({
      title: "Actual challenge",
      data: activeChallenges,
      isUserChallenge: true,
    });

    if (filteredChallenges.length > 0) {
      sections.push({
        title: "Challenges list",
        data: showAll ? filteredChallenges : [],
        isUserChallenge: false,
      });
    }
  } else if (filteredChallenges.length > 0) {
    sections.push({
      title: "Challenges list",
      data: filteredChallenges,
      isUserChallenge: false,
    });
  }


  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {TYPES.map(({ label, value }, i) => (
          <TouchableOpacity
            key={value}
            onPress={() => setSelectedType(value)}
            style={{
              flex: 1,
              padding: 15,
              marginRight: i === 0 ? 5 : 0,
              marginLeft: i === 1 ? 5 : 0,
              borderRadius: radius.md,
              backgroundColor:
                selectedType === value
                  ? colors.buttonActive
                  : colors.button,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText style={{ color: colors.text, fontWeight: "bold" }}>
              {label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10, height: 85, flexGrow: 0 }}
        contentContainerStyle={{
          alignItems: "flex-start",
          paddingLeft: 0,
          paddingRight: 5,
          paddingBottom: 20,
        }}
      >
        {!loading.meta &&
          tags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => toggleTag(tag.id)}
              onLongPress={() => router.push(`/editTag/${tag.id}`)}
              delayLongPress={300}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginRight: 5,
                borderRadius: radius.md,
                backgroundColor: selectedTags.includes(tag.id)
                  ? colors.buttonActive
                  : colors.button,
              }}
            >
              <AppText style={{ color: colors.text }}>{tag.name}</AppText>
            </TouchableOpacity>
          ))}

        <TouchableOpacity
          onPress={() => router.push("/addTag")}
          style={{
            width: 34,
            height: 34,
            borderRadius: 20,
            backgroundColor: colors.buttonActive,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AppText style={{ fontSize: 24, color: "#fff" }}>+</AppText>
        </TouchableOpacity>
      </ScrollView>
      {!loading.list && challenges.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <AppText style={{ color: "#777", fontSize: 16 }}>
            No challenges yet, add some!
          </AppText>
        </View>
      ) : !loading.list && sections.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <AppText style={{ color: "#777", fontSize: 16 }}>
            No challenges with those tags
          </AppText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, section }) => (
            <ChallengeItem
              item={item}
              isUserChallenge={section.isUserChallenge}
            />
          )}
          renderSectionHeader={({ section: { title } }) => {
            const isExpandable = title === "Challenges list";
            return (
              <TouchableOpacity
                onPress={() => {
                  if (isExpandable) setShowAll((prev) => !prev);
                }}
                style={{ marginVertical: 10 }}
              >
                <AppText
                  style={{
                    fontSize: 17,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  {title}
                </AppText>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <FloatingButton
        onPress={() =>
          router.push({
            pathname: "/addChallenge",
            params: { type: selectedType },
          })
        }
      />
    </View>
  );
};

export default ChallengesScreen;
