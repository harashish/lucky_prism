import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import CategoryFormScreen from "../features/todos/CategoryFormScreen";

export default function AddCategory() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Category",
    });
  }, []);

  return <CategoryFormScreen />;
}