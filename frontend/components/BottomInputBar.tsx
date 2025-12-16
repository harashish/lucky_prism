import React from "react";
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

export default function BottomInputBar({
  quickText,
  setQuickText,
  onOpenDifficulty,
  onQuickAdd
}: any) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      style={{ width: "100%" }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          backgroundColor: colors.background
        }}
      >
        <TouchableOpacity
          onPress={onOpenDifficulty}
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: colors.card,
            marginRight: 8,
          }}
        >
          <AppText>D</AppText>
        </TouchableOpacity>

        <TextInput
          value={quickText}
          onChangeText={setQuickText}
          placeholder="Quick add..."
          placeholderTextColor="#7a7891"
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            backgroundColor: colors.card,
            marginRight: 8,
            color: colors.text
          }}
        />

        <TouchableOpacity
          onPress={onQuickAdd}
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: colors.buttonActive
          }}
        >
          <AppText style={{ color: "#fff" }}>+</AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
