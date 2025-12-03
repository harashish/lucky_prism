import TagsFormScreen from "../../components/TagsFormScreen";
import { useLocalSearchParams } from "expo-router";

export default function EditTag() {
  const params = useLocalSearchParams();
  const editingTagId = params?.id ? parseInt(params.id as string, 10) : undefined;

  return <TagsFormScreen editingTagId={editingTagId} />;
}
