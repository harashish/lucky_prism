import { useEffect, useLayoutEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import ChallengeFormScreen from "../features/challenges/ChallengeFormScreen";
import { useChallengeStore } from "./stores/useChallengeStore";


export default function AddChallenge() {
  const navigation = useNavigation();
  const { type } = useLocalSearchParams<{ type?: "Daily" | "Weekly" }>();
  const { setSelectedType } = useChallengeStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Challenge",
    });
  }, []);

  useEffect(() => {
    if (type) {
      setSelectedType(type);
    }
  }, [type]);


  return <ChallengeFormScreen />;
}