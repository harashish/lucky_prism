// frontend/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";

export default function TabsLayout() {
  return (
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
      <Tabs.Screen
        name="ChallengeListScreen"
        options={{
          title: "Challenge"
        }}
      />
      <Tabs.Screen name="GamificationScreen" options={{ title: "Level" }} />
    </Tabs>
  );
}
