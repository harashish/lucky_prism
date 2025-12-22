import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import CategoryFormScreen from "../components/CategoryFormScreen";

export default function AddCategory() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Category",
    });
  }, []);

  return <CategoryFormScreen />;
}