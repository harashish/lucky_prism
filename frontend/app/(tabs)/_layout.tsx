import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "../../constants/theme";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { View, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsLayout() {
  const { modules, fetchModules } = useModuleSettingsStore();

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
        <Tabs.Screen name="index" />
        <Tabs.Screen name="ChallengesListScreen" />
        <Tabs.Screen name="HabitsScreen" />
        <Tabs.Screen name="TodosScreen" />
        <Tabs.Screen name="GoalsScreen" />
        <Tabs.Screen name="RandomHomeScreen" />
        <Tabs.Screen name="GamificationScreen" />
        <Tabs.Screen name="SettingsScreen" />
      </Tabs>
  );
}
