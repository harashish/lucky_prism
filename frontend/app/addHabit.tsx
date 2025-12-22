import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import HabitFormScreen from "../components/HabitFormScreen";

export default function AddHabit() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Habit",
    });
  }, []);

  return <HabitFormScreen />;
}
