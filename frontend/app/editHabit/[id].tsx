import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import HabitFormScreen from "../../features/habits/HabitFormScreen";

export default function EditHabit() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Habit" });
  }, [id]);

  return <HabitFormScreen editingId={Number(id)} />;
}
