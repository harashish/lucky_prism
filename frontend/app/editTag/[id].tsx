import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import TagsFormScreen from "../../features/challenges/TagsFormScreen";

export default function EditTag() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Tag" });
  }, [id]);

  return <TagsFormScreen editingId={Number(id)} />;
}
