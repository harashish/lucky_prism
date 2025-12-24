import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { colors, fonts } from "../constants/theme";


export const defaultHeaderOptions = {
  headerShown: true,
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTitleStyle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.nunitoRegular,
  },
  headerShadowVisible: false,

  headerLeft: () => (
    <Pressable
      onPress={() => router.back()}
      hitSlop={10}
      style={{ paddingRight: 12 }}
    >
      <Ionicons name="arrow-back" size={22} color={colors.text} />
    </Pressable>
  ),
};
