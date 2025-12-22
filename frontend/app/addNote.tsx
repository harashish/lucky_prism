import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import NoteFormScreen from "../features/notes/NoteFormScreen";

export default function AddNote() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Note",
    });
  }, []);

  return <NoteFormScreen />;
}
