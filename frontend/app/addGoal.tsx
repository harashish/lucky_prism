import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import GoalFormScreen from "../features/goals/GoalFormScreen";

export default function AddGoal() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Goal",
    });
  }, []);

  return <GoalFormScreen />;
}