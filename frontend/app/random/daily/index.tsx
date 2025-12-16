import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import AppText from "../../../components/AppText";
import { useChallengeStore } from "../../stores/useChallengeStore";
import { useRouter } from "expo-router";
import { colors } from "../../../constants/theme";
import RandomSpin from "../spin";

export default function DailyPickScreen() {
  const router = useRouter();
  const userId = 1;
  const { loadTags, tags, randomChallenge } = useChallengeStore();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [spinItems, setSpinItems] = useState<string[]>([]);

  useEffect(() => { loadTags(); }, []);

  const toggleTag = (id:number) => setSelectedTags(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const onLosuj = async () => {
    if (!tags.length) return Alert.alert("no tags");
    const picked = await randomChallenge(userId, "Daily", selectedTags);
    if (!picked) return Alert.alert("no challenges with selected tags");

    setSpinning(true);
    setSpinItems(["...", "Randomizing", "Searching", "Wait", "OK"]);
    setTimeout(() => {
      setSpinning(false);
      router.push({ pathname:"/random/result", params:{ item: JSON.stringify(picked), source:"challenge" }});
    }, 600);
  };

  if (spinning) return <RandomSpin items={spinItems.length ? spinItems : ["..."]} onFinish={() => {}} />;

return (
  <View style={{ flex:1, backgroundColor: colors.background }}>
    <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1, 
        justifyContent: "center",  // centrowanie w pionie
        alignItems: "center",      // centrowanie w poziomie
        padding: 16
      }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity 
        onPress={onLosuj} 
        style={{ backgroundColor: colors.buttonActive, padding:16, borderRadius:10, marginBottom:12, width: "80%", alignItems:"center" }}
      >
        <AppText style={{ color:"#fff", fontWeight:"bold" }}>Randomize!</AppText>
      </TouchableOpacity>

      <AppText style={{ marginBottom:8 }}>Filter by tags:</AppText>

      <View style={{ flexDirection:"row", flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}>
        {tags.map(t => (
          <TouchableOpacity 
            key={t.id} 
            onPress={() => toggleTag(t.id)} 
            style={{ 
              padding:8, 
              margin:6, 
              borderRadius:8, 
              backgroundColor: selectedTags.includes(t.id) ? colors.buttonActive : colors.card 
            }}
          >
            <AppText>{t.name}</AppText>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </View>
);


}
