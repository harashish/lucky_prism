import { useLocalSearchParams } from "expo-router";
import AchievementFormScreen from "../../features/achievements/AchievementFormScreen";

export default function EditAchievement() {
  const { id } = useLocalSearchParams();

  return (
    <AchievementFormScreen editingId={Number(id)} />
  );
}