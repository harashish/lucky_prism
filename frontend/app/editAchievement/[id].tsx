import { useLayoutEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AchievementFormScreen from "../../features/achievements/AchievementFormScreen";

export default function EditAchievement() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

    useLayoutEffect(() => {
      navigation.setOptions({ headerTitle: "Edit Achievement" });
    }, [id]);

  return (
    <AchievementFormScreen editingId={Number(id)} />
  );
}