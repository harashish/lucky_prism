import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Alert, Animated } from "react-native";
import AppText from "../../components/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../constants/theme";
import { api } from "../api/apiClient";

export default function RandomResultScreen(){
  const { item, source, categoryId } = useLocalSearchParams() as any;
  const router = useRouter();
  const userId = 1;

  const [currentItem, setCurrentItem] = useState(item ? JSON.parse(item) : null);
  const slideAnim = useRef(new Animated.Value(0)).current; // start position

  // challenge accept
  const onAssignChallenge = async () => {
    if (!currentItem) return;
    try {
      await api.post("/challenges/assign/", { user: userId, challenge: currentItem.id });
      router.replace(currentItem.type?.name === "Daily" ? "/random/daily/active" : "/random/weekly/active");
    } catch (e: any) {
      const err = e.response?.data || e.message || e;
      Alert.alert("Błąd przypisania", typeof err === "string" ? err : JSON.stringify(err));
    }
  };

  // slide animation przy losuj dalej
  const slideTodo = (nextItem: any) => {
    Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }).start(() => {
      setCurrentItem(nextItem);
      slideAnim.setValue(50); // start poniżej
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
  };

  // losuj dalej
  const onLosujDalej = async () => {
    try {
      const res = await api.get("/todos/tasks/", { params: { user_id: userId, category_id: categoryId }});
      const arr = res.data.filter((t:any) => !t.is_completed);
      if (!arr.length) { Alert.alert("Lista pusta", "Brak niewykonanych zadań."); return; }
      const next = arr[Math.floor(Math.random() * arr.length)];
      slideTodo(next);
    } catch (e) { Alert.alert("Błąd losowania", "Spróbuj ponownie."); }
  };

  if (!currentItem) return null;

  const todoCard = (
    <Animated.View style={{
      transform: [{ translateY: slideAnim }],
      padding: 28,
      borderWidth: 2,
      borderColor: colors.buttonActive,
      borderRadius: 16,
      marginVertical: 40,
      alignSelf: "center",
      maxWidth: "90%",
      backgroundColor: colors.card,
    }}>
      <AppText style={{ 
        fontSize: 28, 
        fontWeight: "800", 
        textAlign: "center",
        lineHeight: 36,
      }}>
        {currentItem.content}
      </AppText>
    </Animated.View>
  );

  return (
    <View style={{ flex:1, padding:18, backgroundColor: colors.background, justifyContent:"center" }}>
      {source === "challenge" && (
        <>
          <View style={{ padding:22, borderWidth:2, borderRadius:16, borderColor: colors.buttonActive, alignSelf:"center", maxWidth:"90%", backgroundColor: colors.card }}>
            <AppText style={{ fontSize:20, fontWeight:"800", textAlign:"center", marginBottom:8 }}>{currentItem.title}</AppText>
            <AppText style={{ textAlign:"center" }}>{currentItem.description}</AppText>
          </View>

          <TouchableOpacity onPress={onAssignChallenge} style={{ backgroundColor: colors.buttonActive, padding:12, borderRadius:10, marginTop:12 }}>
            <AppText style={{ color:"#fff", fontWeight:"bold" }}>Akceptuj</AppText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ padding:12, borderRadius:10, backgroundColor: colors.card, marginTop:8 }}>
            <AppText>Anuluj</AppText>
          </TouchableOpacity>
        </>
      )}

      {source === "todo" && (
        <>
          {todoCard}
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: colors.card, padding:14, borderRadius:10, marginBottom:12 }}>
            <AppText>OK</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLosujDalej} style={{ backgroundColor: colors.buttonActive, padding:14, borderRadius:10, marginBottom:12 }}>
            <AppText style={{ color:"#fff" }}>Losuj dalej</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/random/todo")} style={{ backgroundColor: colors.card, padding:14, borderRadius:10 }}>
            <AppText>Zmień kategorię</AppText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
