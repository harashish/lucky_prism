import { useLocalSearchParams, useNavigation } from "expo-router";
import TodoTaskFormScreen from "../../features/todos/TodoTaskFormScreen";
import { useLayoutEffect } from "react";

export default function EditTodoRoute() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Todo" });
  }, [id]);

  return <TodoTaskFormScreen editingId={Number(id)} />;
}

