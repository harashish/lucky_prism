import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, ScrollView, Alert } from "react-native";
import AppText from "../../../components/AppText";
import { api } from "../../api/apiClient";
import { colors } from "../../../constants/theme";
import { useRouter } from "expo-router";
import RandomSpin from "../spin";

export default function TodoPickScreen() {
  const router = useRouter();
  const userId = 1;

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [spinning, setSpinning] = useState(false);
  const [spinItems, setSpinItems] = useState<string[]>([]);

  useEffect(()=>{ 
    (async ()=>{ 
      try { 
        const res = await api.get("/todos/categories/"); 
        setCategories(res.data); 
        if(res.data.length) setSelectedCategory(res.data[0].id) 
      } catch(e){console.error(e);} 
    })(); 
  }, []);

  const onLosuj = async () => {
    if (!selectedCategory) return Alert.alert("Choose a category");

    setSpinning(true);
    setSpinItems(["...", "Randomizing", "Searching", "Wait", "OK"]);

    try {
      const res = await api.get("/todos/tasks/", { params: { user_id: userId, category_id: selectedCategory }});
      let arr = res.data.filter((t:any) => !t.is_completed);
      if (!arr.length) {
        setSpinning(false);
        Alert.alert("no tasks in this category");
        return;
      }

      setTimeout(() => {
        const pickedIndex = Math.floor(Math.random() * arr.length);
        const picked = arr[pickedIndex];
        setSpinning(false);
        router.push({ pathname: "/random/result", params: { item: JSON.stringify(picked), source: "todo", categoryId: String(selectedCategory) }});
      }, 600);

    } catch(e){ 
      setSpinning(false);
      Alert.alert("Błąd", "can't load tasks" ); 
    }
  };

  if (spinning) return <RandomSpin items={spinItems.length ? spinItems : ["..."]} onFinish={() => {}} />;

  return (
    <View style={{ flex:1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center", // centrowanie pionowe
          alignItems: "center",     // centrowanie poziome
          padding: 16
        }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity 
          onPress={onLosuj} 
          style={{ backgroundColor: colors.buttonActive, padding:16, borderRadius:10, marginBottom:12, width:"80%", alignItems:"center" }}
        >
          <AppText style={{ color:"#fff", fontWeight:"bold" }}>Randomize!</AppText>
        </TouchableOpacity>

        <AppText style={{ marginBottom:8 }}>Choose a category:</AppText>

        <View style={{ flexDirection:"row", flexWrap:"wrap", justifyContent:"center", alignItems:"center" }}>
          {categories.map(c => (
            <TouchableOpacity 
              key={c.id} 
              onPress={()=>setSelectedCategory(c.id)} 
              style={{ 
                padding:8, 
                margin:6, 
                borderRadius:8, 
                backgroundColor: selectedCategory===c.id ? colors.buttonActive : colors.card 
              }}
            >
              <AppText>{c.name}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
