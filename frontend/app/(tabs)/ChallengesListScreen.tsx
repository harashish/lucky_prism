// frontend/app/(tabs)/ChallengesListScreen.tsx

import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet, SectionList } from "react-native";
import { useChallengeStore, ChallengeWithUserInfo } from "../stores/useChallengeStore";
import ChallengeItem from "../../components/ChallengeItem";
import { useRouter } from "expo-router";
import AppText from "../../components/AppText";
import HeaderText from "../../components/HeaderText";
import { colors } from "../../constants/theme";

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

  const [selectedType, setSelectedType] = useState<"Daily" | "Weekly">("Daily");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const { activeDaily, activeWeekly } = useChallengeStore();

  const activeChallengeBox = activeDaily || activeWeekly[0]; // jeśli więcej weekly, bierzemy pierwszy


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
    progress_percent: uc.progress_percent,
  }));



const [showAll, setShowAll] = useState(false);

const hasAssigned = assignedChallenges.length > 0;
const hasUnassigned = unassignedChallenges.length > 0;

const sections = [];

// 1. Jeśli są przypisane challengy
if (hasAssigned) {
  sections.push({ title: "Actual challenge", data: assignedChallenges });

  // 2. Jeśli dodatkowo są challengy do pokazania
  if (hasUnassigned) {
    sections.push({ title: "Challenges list", data: showAll ? unassignedChallenges : [] });
  }
} else if (!hasAssigned && hasUnassigned) {
  // 3. Brak przypisanych, ale są dostępne challengy → pokazujemy rozwiniętą listę
  sections.push({ title: "Challenges list", data: unassignedChallenges });
}

// Jeśli nie ma żadnych challengy, sections pozostaje puste




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
        marginRight: i === 0 ? 5 : 0, // odstęp między kafelkami
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
  style={{ marginBottom: 10, height: 80, flexGrow: 0 }}
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.buttonActive,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <AppText style={{ fontSize: 24, color: "#fff" }}>＋</AppText>
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
            {title} {isExpandable && !showAll ? "↩" : ""}
          </AppText>
        </TouchableOpacity>
      );
    }}
    contentContainerStyle={{ paddingBottom: 100 }}
  />
)}

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/addChallenge")}
      >
        <AppText style={{ fontSize: 32, color: "#fff" }}>＋</AppText>
      </TouchableOpacity>
    </View>
  );
};

export default ChallengesListScreen;


const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.buttonActive,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.buttonActive,
    justifyContent: "center",
    alignItems: "center",
  },
});
