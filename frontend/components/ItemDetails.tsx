import { View } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

type ItemDetailsProps = {
  description?: string;
  motivation?: string;
};

export function ItemDetails({ description, motivation }: ItemDetailsProps) {
  if (!description && !motivation) return null;

  return (
    <View style={{ marginTop: 8 }}>
      {description && (
        <AppText style={{ marginBottom: motivation ? 6 : 0, fontSize: 12, }}>
          {description}
        </AppText>
      )}

      {motivation && (
        <AppText
          style={{
            fontSize: 12,
            opacity: 0.8,
            color: colors.light
          }}
        >
          Motivation: {motivation}
        </AppText>
      )}
    </View>
  );
}
