import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="challenges" options={{ title: "Challenges" }} />
      <Tabs.Screen name="habits" options={{ title: "Habits" }} />
    </Tabs>
  );
}
