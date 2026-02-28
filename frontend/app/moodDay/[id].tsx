import { useLayoutEffect } from "react";
import { useNavigation, useLocalSearchParams } from "expo-router";
import MoodDayScreen from "../../features/mood/MoodDayScreen";

export default function MoodDayRoute() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

    useLayoutEffect(() => {
      navigation.setOptions({
      headerTitle: "View Day",
    });
  }, [id]);

  return <MoodDayScreen />;
}

