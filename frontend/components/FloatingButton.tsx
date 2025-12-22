import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

export default function FloatingButton({ onPress, style, children }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children ?? <AppText style={{ fontSize: 32, color: "#fff" }}>＋</AppText>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.buttonActive,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
