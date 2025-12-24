import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../constants/theme";
import { ModuleKey, useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";

export default function TabsLayout() {
  const { modules, fetchModules } = useModuleSettingsStore();

  const TAB_MODULE_MAP: Record<string, ModuleKey | null> = {
  index: null,
  HabitsScreen: "habits",
  TodosScreen: "todos",
  ChallengesListScreen: "challenges",
  GoalsScreen: "goals",
  RandomHomeScreen: "random",
  GamificationScreen: "gamification",
  SettingsScreen: null,
  };


  const isTabEnabled = (routeName: string) => {
    const module = TAB_MODULE_MAP[routeName];
    if (!module) return true;
    return modules?.[module];
  };

  const TAB_CONFIG: Record<
    string,
    {
      label: string;
      icon: keyof typeof Ionicons.glyphMap;
      iconOutline: keyof typeof Ionicons.glyphMap;
    }
  > = {
    index: {
      label: "Home",
      icon: "home",
      iconOutline: "home-outline",
    },
    HabitsScreen: {
      label: "Habits",
      icon: "repeat",
      iconOutline: "repeat-outline",
    },
    TodosScreen: {
      label: "Todos",
      icon: "checkbox",
      iconOutline: "checkbox-outline",
    },
    ChallengesListScreen: {
      label: "Challenges",
      icon: "flame",
      iconOutline: "flame-outline",
    },
    GoalsScreen: {
      label: "Goals",
      icon: "flag",
      iconOutline: "flag-outline",
    },
    RandomHomeScreen: {
      label: "Random",
      icon: "shuffle",
      iconOutline: "shuffle-outline",
    },
    GamificationScreen: {
      label: "Level",
      icon: "game-controller",
      iconOutline: "game-controller-outline",
    },
    SettingsScreen: {
      label: "Settings",
      icon: "settings",
      iconOutline: "settings-outline",
    },
  };

  useEffect(() => {
    fetchModules();
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
    
      <Tabs
        initialRouteName="index"
        screenOptions={( { route })  => {
          const config = TAB_CONFIG[route.name];

          return {
            headerShown: true,
            headerTitle: config?.label ?? "",
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTitleStyle: {
              color: colors.text,
              fontSize: 20,
              fontFamily: fonts.nunitoRegular,
            },
            headerShadowVisible: false,

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
    <Tabs.Screen
      name="index"
      options={{
        href: isTabEnabled("index") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="HabitsScreen"
      options={{
        href: isTabEnabled("HabitsScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="TodosScreen"
      options={{
        href: isTabEnabled("TodosScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="ChallengesListScreen"
      options={{
        href: isTabEnabled("ChallengesListScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="GoalsScreen"
      options={{
        href: isTabEnabled("GoalsScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="RandomHomeScreen"
      options={{
        href: isTabEnabled("RandomHomeScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="GamificationScreen"
      options={{
        href: isTabEnabled("GamificationScreen") ? undefined : null,
      }}
    />

    <Tabs.Screen
      name="SettingsScreen"
      options={{
        href: isTabEnabled("SettingsScreen") ? undefined : null,
      }}
    />
  </Tabs>
  );
}
