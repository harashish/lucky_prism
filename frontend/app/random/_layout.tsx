import { Stack } from "expo-router";

export default function RandomLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
