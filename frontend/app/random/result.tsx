import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, Alert, Animated, ActivityIndicator } from "react-native";
import AppText from "../../components/AppText";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors } from "../../constants/theme";
import { api } from "../api/apiClient";
import RandomResultCard from "../../components/RandomResultCard";


export default function RandomResultScreen(){
  const { item, source, categoryId } = useLocalSearchParams() as any;
  const router = useRouter();

  const [currentItem, setCurrentItem] = useState(item ? JSON.parse(item) : null);
  const [assigning, setAssigning] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    if (source === "challenge" && currentItem && !assigned && !assigning) {
      (async () => {
        setAssigning(true);
        try {
          await api.post("/challenges/assign/", { challenge: currentItem.id });
          setAssigned(true);
        } catch (e: any) {
          const err = e.response?.data?.detail || e.response?.data || e.message || e;
          Alert.alert("Error", typeof err === "string" ? err : JSON.stringify(err));
        } finally {
          setAssigning(false);
        }
      })();
    }
  }, [source, currentItem]);

  useEffect(() => {
    if (!currentItem) {
      router.replace("/(tabs)/RandomHomeScreen");
    }
  }, [currentItem]);


  const slideTodo = (nextItem: any) => {
    Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }).start(() => {
      setCurrentItem(nextItem);
      slideAnim.setValue(50);
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    });
  };

  const onReroll = async () => {
    try {
      const res = await api.get("/todos/tasks/", { params: { category_id: categoryId }});
      const arr = res.data.filter((t:any) => !t.is_completed);
      if (!arr.length) { Alert.alert("Empty List", "No todos."); return; }
      const next = arr[Math.floor(Math.random() * arr.length)];
      slideTodo(next);
    } catch (e) { Alert.alert("Error", "Try again."); }
  };

  if (!currentItem) return null;

  const todoCard = (
    <RandomResultCard
      title={currentItem.content}
      animatedStyle={{
        transform: [{ translateY: slideAnim }],
      }}
    />
  );


  const goToActive = () => {
    if (!currentItem) return router.replace("/(tabs)/RandomHomeScreen");
    const dest = currentItem.type?.name === "daily" ? "/random/daily/active" : "/random/weekly/active";
    router.replace(dest);
  };

  return (
    <View style={{ flex:1, padding:18,  justifyContent:"center" }}>
      {source === "challenge" && (
        <>
          <RandomResultCard
              title={currentItem.title}
              description={currentItem.description}
            />


          {assigning && (
            <View style={{ marginTop:12, alignItems:"center" }}>
              <ActivityIndicator color={colors.buttonActive} />
              <AppText style={{ marginTop:8 }}>Assigning...</AppText>
            </View>
          )}

          {!assigning && (
            <TouchableOpacity onPress={goToActive} style={{ backgroundColor: colors.card, padding:14, borderRadius:10, marginTop:12 }}>
              <AppText style={{ textAlign: "center" }}>OK</AppText>
            </TouchableOpacity>
          )}
        </>
      )}

      {source === "todo" && (
        <>
          {todoCard}
          <TouchableOpacity onPress={() => router.replace("/random/todo")} style={{ backgroundColor: colors.card, padding:14, borderRadius:10, marginBottom:12 }}>
            <AppText style={{ textAlign: "center" }}>OK</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReroll} style={{ backgroundColor: colors.buttonActive, padding:14, borderRadius:10, marginBottom:12 }}>
            <AppText style={{ textAlign: "center", color:"#fff" }}>Reroll</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/random/todo")} style={{ backgroundColor: colors.card, padding:14, borderRadius:10 }}>
            <AppText style={{ textAlign: "center" }}>Change category</AppText>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
