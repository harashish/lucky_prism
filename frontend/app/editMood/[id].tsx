import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import MoodFormScreen from "../../features/mood/MoodFormScreen";

export default function EditMood() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Edit Mood",
    });
  }, [id]);

  return <MoodFormScreen editingId={Number(id)} />;
}