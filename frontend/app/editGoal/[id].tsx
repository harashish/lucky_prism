import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import GoalFormScreen from "../../features/goals/GoalFormScreen";

export default function EditGoal() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Goal" });
  }, [id]);

  return <GoalFormScreen editingId={Number(id)} />;
}
