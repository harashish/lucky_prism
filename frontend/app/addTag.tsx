import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import TagsFormScreen from "../features/challenges/TagsFormScreen";

export default function AddTag() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Tag",
    });
  }, []);

  return <TagsFormScreen/>;
}