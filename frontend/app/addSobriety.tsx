import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import SobrietyFormScreen from "../features/sobriety/SobrietyFormScreen";

export default function AddSobriety() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Add Sobriety",
    });
  }, []);

  return <SobrietyFormScreen />;
}