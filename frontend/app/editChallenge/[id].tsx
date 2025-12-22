import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import ChallengeFormScreen from "../../components/ChallengeFormScreen";

export default function EditChallenge() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "Edit Challenge" });
  }, [id]);

  return <ChallengeFormScreen editingId={Number(id)} />;
}