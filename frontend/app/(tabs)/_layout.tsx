import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";
import { ModuleKey, useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserPreferencesStore } from "../stores/useUserPreferenceStore";
import * as Notifications from "expo-notifications";

const TAB_MODULE_MAP: Record<string, ModuleKey | null> = {
  index: null,
  HabitsScreen: "habits",
  TodosScreen: "todos",
  ChallengesScreen: "challenges",
  GoalsScreen: "goals",
  RandomScreen: "random",
  GamificationScreen: "gamification",
  MoodScreen: "mood",
  SobrietyScreen: "sobriety",
  SettingsScreen: null,
};

const TAB_CONFIG = {
  index: { label: "Home", icon: "home", iconOutline: "home-outline" },
  HabitsScreen: { label: "Habits", icon: "repeat", iconOutline: "repeat-outline" },
  TodosScreen: { label: "Todos", icon: "checkbox", iconOutline: "checkbox-outline" },
  ChallengesScreen: { label: "Challenges", icon: "flame", iconOutline: "flame-outline" },
  GoalsScreen: { label: "Goals", icon: "flag", iconOutline: "flag-outline" },
  RandomScreen: { label: "Random", icon: "shuffle", iconOutline: "shuffle-outline" },
  GamificationScreen: { label: "Level", icon: "game-controller", iconOutline: "game-controller-outline" },
  MoodScreen: { label: "Mood", icon: "happy", iconOutline: "happy-outline" },
  SobrietyScreen: { label: "Sobriety", icon: "link", iconOutline: "link-outline" },
  SettingsScreen: { label: "Settings", icon: "settings", iconOutline: "settings-outline" },
};

export default function TabsLayout() {
  const { modules, fetchModules } = useModuleSettingsStore();
  const { fetchPreferences } = useUserPreferencesStore();

  const isTabEnabled = (routeName: string) => {
  const module = TAB_MODULE_MAP[routeName];
  if (!module) return true;
  return modules?.[module];
};

  useEffect(() => {
    fetchModules();
    fetchPreferences();
  }, []);

  useEffect(() => {
  Notifications.requestPermissionsAsync();

  Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
}, []);

  if (!modules) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.buttonActive} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        initialRouteName="index"
        screenOptions={({ route }) => {
          const config = TAB_CONFIG[route.name];

          return {
            headerShown: false,

            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "#15151aff",
              borderTopColor: "transparent",
              height: 68,
            },

            tabBarIcon: ({ focused }) => {
              if (!config) return null;

              return (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 80,
                    height: 40,
                    marginTop: 25,
                  }}
                >
                  <Ionicons
                    name={focused ? config.icon : config.iconOutline}
                    size={18}
                    color={focused ? colors.buttonActive : "#7a7891"}
                  />
                </View>
              );
            },
          };
        }}
      >
        <Tabs.Screen name="index" options={{ href: isTabEnabled("index") ? undefined : null }} />
        <Tabs.Screen name="HabitsScreen" options={{ href: isTabEnabled("HabitsScreen") ? undefined : null }} />
        <Tabs.Screen name="TodosScreen" options={{ href: isTabEnabled("TodosScreen") ? undefined : null }} />
        <Tabs.Screen name="ChallengesScreen" options={{ href: isTabEnabled("ChallengesScreen") ? undefined : null }} />
        <Tabs.Screen name="GoalsScreen" options={{ href: isTabEnabled("GoalsScreen") ? undefined : null }} />
        <Tabs.Screen name="MoodScreen" options={{ href: isTabEnabled("MoodScreen") ? undefined : null }} />
        <Tabs.Screen name="SobrietyScreen" options={{ href: isTabEnabled("SobrietyScreen") ? undefined : null }} />
        <Tabs.Screen name="RandomScreen" options={{ href: isTabEnabled("RandomScreen") ? undefined : null }} />
        <Tabs.Screen name="GamificationScreen" options={{ href: isTabEnabled("GamificationScreen") ? undefined : null }} />
        <Tabs.Screen name="SettingsScreen" options={{ href: isTabEnabled("SettingsScreen") ? undefined : null }} />
      </Tabs>
    </SafeAreaView>
  );
}