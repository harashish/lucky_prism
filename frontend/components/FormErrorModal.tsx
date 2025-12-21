import React from "react";
import { Modal, View, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import { colors, spacing, radius } from "../constants/theme";

type Props = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export default function FormErrorModal({ visible, message, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.l,
        }}
      >
        <View
          style={{
            width: "100%",
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.l,
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: "bold", marginBottom: spacing.s }}>
            Missing information
          </AppText>

          <AppText style={{ marginBottom: spacing.l }}>
            {message}
          </AppText>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.buttonActive,
              padding: spacing.m,
              borderRadius: radius.md,
              alignItems: "center",
            }}
          >
            <AppText style={{ color: "#fff", fontWeight: "bold" }}>
              OK
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
