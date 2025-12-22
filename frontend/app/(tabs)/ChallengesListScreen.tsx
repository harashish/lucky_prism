import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, SectionList } from "react-native";
import { useChallengeStore, ChallengeWithUserInfo } from "../stores/useChallengeStore";
import ChallengeItem from "../../features/challenges/ChallengeItem";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";
import { colors } from "../../constants/theme";
import FloatingButton from "../../components/FloatingButton";

const ChallengesListScreen = () => {
  const router = useRouter();
  const { 
    challenges, 
    tags, 
    userChallenges, 
    loadChallenges, 
    loadTags, 
    loadUserChallenges 
  } = useChallengeStore();

  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const { selectedType, setSelectedType } = useChallengeStore();


  //const { activeDaily, activeWeekly } = useChallengeStore();

  //const activeChallengeBox = activeDaily || activeWeekly[0]; // jeśli więcej weekly, bierzemy pierwszy

  const userId = 1;

  const fetchData = async () => {
    await loadChallenges();
    await loadTags();
    await loadUserChallenges(userId);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTag = (id: number) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredChallenges = challenges.filter(c =>
    c.type.name === selectedType &&
    (selectedTags.length === 0 || selectedTags.some(tid => c.tags.some(t => t.id === tid)))
  );

  const userChallengeIds: number[] = userChallenges.map(uc => uc.challenge.id);

  const unassignedChallenges: ChallengeWithUserInfo[] = filteredChallenges
    .filter(c => !userChallengeIds.includes(c.id))
    .map(c => ({ ...c }));

const assignedChallenges: ChallengeWithUserInfo[] = userChallenges
  .filter(uc => uc.challenge.type.name === selectedType &&
       (selectedTags.length === 0 || selectedTags.some(tid => uc.challenge.tags.some(t => t.id === tid)))
  )
  .map(uc => ({
    ...uc.challenge,
    userChallengeId: uc.id,
    challenge_type: uc.challenge_type,
    progress_days: uc.progress_days,

  }));



const [showAll, setShowAll] = useState(false);

const hasAssigned = assignedChallenges.length > 0;
const hasUnassigned = unassignedChallenges.length > 0;

const sections = [];

if (hasAssigned) {
  sections.push({ title: "Actual challenge", data: assignedChallenges });
  if (hasUnassigned) {
    sections.push({ title: "Challenges list", data: showAll ? unassignedChallenges : [] });
  }
} else if (!hasAssigned && hasUnassigned) {
  sections.push({ title: "Challenges list", data: unassignedChallenges });
}


  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: colors.background }}>
    {/* Typy */}
<View style={{ flexDirection: "row", marginBottom: 10 }}>
  {["Daily", "Weekly"].map((t, i) => (
    <TouchableOpacity
      key={t}
      onPress={() => setSelectedType(t as "Daily" | "Weekly")}
      style={{
        flex: 1,
        padding: 15,
        marginRight: i === 0 ? 5 : 0,
        marginLeft: i === 1 ? 5 : 0,
        borderRadius: 10,
        backgroundColor: selectedType === t ? colors.buttonActive : colors.button,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText style={{ color: colors.text, fontWeight: "bold" }}>{t}</AppText>
    </TouchableOpacity>
  ))}
</View>

{/* Tagi */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ marginBottom: 10, height: 85, flexGrow: 0 }}
  contentContainerStyle={{ alignItems: "flex-start", paddingLeft: 0, paddingRight: 5, paddingBottom: 20 }}
>
  {tags.map(tag => (
    <TouchableOpacity
      key={tag.id}
      onPress={() => toggleTag(tag.id)}
      onLongPress={() => router.push(`/editTag/${tag.id}`)}
      delayLongPress={300}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 5,
        borderRadius: 10,
        backgroundColor: selectedTags.includes(tag.id) ? colors.buttonActive : colors.button,
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

{/* Lista challenge */}
{challenges.length === 0 ? (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
    <AppText style={{ color: "#777", fontSize: 16 }}>No challenges yet, add some!</AppText>
  </View>
) : filteredChallenges.length === 0 ? (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
    <AppText style={{ color: "#777", fontSize: 16 }}>No challenges with those tags</AppText>
  </View>
) : (
  <SectionList
    sections={sections}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <ChallengeItem
        item={item}
        userId={userId}
        alreadyAssigned={!!item.userChallengeId}
        onAssigned={fetchData}
      />
    )}
    renderSectionHeader={({ section: { title } }) => {
      const isExpandable = title === "Challenges list";
      return (
        <TouchableOpacity
          onPress={() => {
            if (isExpandable) setShowAll(prev => !prev);
          }}
          style={{ marginVertical: 10 }}
        >
          <AppText style={{ fontSize: 17, fontWeight: "bold", color: colors.text }}>
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

export default ChallengesListScreen;

const styles = StyleSheet.create({
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.buttonActive,
    justifyContent: "center",
    alignItems: "center",
  },
});
