import { Tabs } from "expo-router";
import { useEffect } from "react";
import { colors } from "../../constants/theme";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function TabsLayout() {
  const { modules, fetchModules } = useModuleSettingsStore();

  useEffect(() => {
    fetchModules();
  }, []);

  if (!modules) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.buttonActive,
        tabBarInactiveTintColor: colors.text,
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />

      <Tabs.Screen
        name="ChallengesListScreen"
        options={{ title: "Challenges", href: modules.challenges ? undefined : null }}
      />

      <Tabs.Screen
        name="GoalsScreen"
        options={{ title: "Goals", href: modules.goals ? undefined : null }}
      />

      <Tabs.Screen
        name="HabitsScreen"
        options={{ title: "Habits", href: modules.habits ? undefined : null }}
      />

      <Tabs.Screen
        name="TodosScreen"
        options={{ title: "Todos", href: modules.todos ? undefined : null }}
      />

      <Tabs.Screen
        name="RandomHomeScreen"
        options={{ title: "Random", href: modules.randomizer ? undefined : null }}
      />

      <Tabs.Screen
        name="GamificationScreen"
        options={{ title: "Level", href: modules.gamification ? undefined : null }}
      />

      <Tabs.Screen name="SettingsScreen" options={{ title: "Settings" }} />
    </Tabs>
    </GestureHandlerRootView>
  );
}
