import AchievementFormScreen from "../features/achievements/AchievementFormScreen";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

export default function AddAchievement() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Achievement",
    });
  }, []);

  return <AchievementFormScreen />;
}