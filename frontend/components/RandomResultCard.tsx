import React from "react";
import { Animated, View } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

type Props = {
  title: string;
  description?: string;
  animatedStyle?: any;
  highlight?: boolean;
};

export default function RandomResultCard({
  title,
  description,
  animatedStyle,
}: Props) {
  const Wrapper: any = animatedStyle ? Animated.View : View;

  return (
    <Wrapper
      style={[
        {
          padding: 28,
          borderWidth: 2,
          borderRadius: 16,
          borderColor: colors.light,
          backgroundColor: colors.card,
          alignSelf: "center",
          maxWidth: "90%",
          marginVertical: 32,
        },
        animatedStyle,
      ]}
    >
      <AppText
        numberOfLines={3}
        style={{
          fontSize: 20,
          fontWeight: "800",
          textAlign: "center",
          lineHeight: 32,
          marginBottom: description ? 8 : 0,
        }}
      >
        {title}
      </AppText>

      {description && (
        <AppText style={{ textAlign: "center", opacity: 0.9 }}>
          {description}
        </AppText>
      )}
    </Wrapper>
  );
}
