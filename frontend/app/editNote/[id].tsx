import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import NoteFormScreen from "../../components/NoteFormScreen";

export default function EditNote() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Note" });
  }, [id]);

  return <NoteFormScreen editingId={Number(id)} />;
}
