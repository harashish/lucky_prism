// frontend/app/_layout.tsx

import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold
} from "@expo-google-fonts/inter";
import { Poppins_400Regular, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { Manrope_400Regular, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../constants/theme";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    Poppins_400Regular, Poppins_600SemiBold,
    Nunito_400Regular, Nunito_700Bold,
    Manrope_400Regular, Manrope_600SemiBold,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
    </View>
  );
}
