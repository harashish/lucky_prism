import GoalFormScreen from "../../components/GoalFormScreen";
import { useLocalSearchParams } from "expo-router";

export default function EditGoal() {
  // expo-router provides id param, GoalFormScreen reads it via useLocalSearchParams
  return <GoalFormScreen />;
}
