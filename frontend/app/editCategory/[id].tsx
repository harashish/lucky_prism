import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import CategoryFormScreen from "../../features/todos/CategoryFormScreen";

export default function EditCategory() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Category" });
  }, [id]);

  return <CategoryFormScreen editingId={Number(id)} />;
}