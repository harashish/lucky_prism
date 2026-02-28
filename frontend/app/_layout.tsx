import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold
} from "@expo-google-fonts/inter";
import { Poppins_400Regular, Poppins_600SemiBold } from "@expo-google-fonts/poppins";
import { Nunito_400Regular, Nunito_700Bold } from "@expo-google-fonts/nunito";
import { Manrope_400Regular, Manrope_600SemiBold } from "@expo-google-fonts/manrope";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../constants/theme";
import XPPopup from "../components/XPPopup";
import { defaultHeaderOptions } from "../components/NavigationHeader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import AchievementPopup from "../components/AchievementPopup";
import { useEffect } from "react";

import { notificationEngine } from "./services/notificationEngine";
import { bootstrapNotifications } from "./services/notificationBootstrap";
import { useHabitStore } from "./stores/useHabitStore";
import { useNotesStore } from "./stores/useNotesStore";
import { useChallengeStore } from "./stores/useChallengeStore";


const router = useRouter();

useEffect(() => {
  const init = async () => {
    await notificationEngine.init();

    // 🔹 Najpierw dane
    await useHabitStore.getState().loadMonth();
    await useNotesStore.getState().fetchNotes();
    await useChallengeStore.getState().loadChallenges?.();

    // 🔹 Bootstrap notyfikacji
    await bootstrapNotifications();
  };

  init();

  // 🔹 Deep linking
  notificationEngine.registerNavigationHandler(router);

}, []);

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    Poppins_400Regular, Poppins_600SemiBold,
    Nunito_400Regular, Nunito_700Bold,
    Manrope_400Regular, Manrope_600SemiBold,
  });


  const AppTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.background,
    },
  };

  if (!loaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
     <ThemeProvider value={AppTheme}>
      <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
          }}
        >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen name="addHabit" options={defaultHeaderOptions} />
        <Stack.Screen name="editHabit/[id]" options={defaultHeaderOptions}  />

        <Stack.Screen name="addGoal" options={defaultHeaderOptions} />
        <Stack.Screen name="editGoal/[id]" options={defaultHeaderOptions} />

        <Stack.Screen name="addChallenge" options={defaultHeaderOptions} />
        <Stack.Screen name="editChallenge/[id]" options={defaultHeaderOptions} />

        <Stack.Screen name="addNote" options={defaultHeaderOptions} />
        <Stack.Screen name="editNote/[id]" options={defaultHeaderOptions} />

        <Stack.Screen name="addTag" options={defaultHeaderOptions} />
        <Stack.Screen name="editTag/[id]" options={defaultHeaderOptions} />

        <Stack.Screen name="addCategory" options={defaultHeaderOptions} />
        <Stack.Screen name="editCategory/[id]" options={defaultHeaderOptions} />

        <Stack.Screen name="random" options={{ headerShown: false }} />

        <Stack.Screen
          name="notes"
          options={defaultHeaderOptions}
        />

      </Stack>

      <XPPopup />
      <AchievementPopup />
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}
