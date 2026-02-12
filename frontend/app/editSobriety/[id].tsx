import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import SobrietyFormScreen from "../../features/sobriety/SobrietyFormScreen";

export default function EditSobriety() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Edit Sobriety",
    });
  }, [id]);

  return <SobrietyFormScreen editingId={Number(id)} />;
}