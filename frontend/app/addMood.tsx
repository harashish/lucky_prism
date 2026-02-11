import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import MoodFormScreen from "../features/mood/MoodFormScreen";

export default function AddMood() {
  const navigation = useNavigation();
  const { date } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Mood",
    });
  }, []);

  return <MoodFormScreen initialDate={date as string} />;
}