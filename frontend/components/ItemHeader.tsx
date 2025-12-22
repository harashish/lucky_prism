import { View } from "react-native";
import AppText from "./AppText";

type ItemHeader = {
  title: string;
  difficulty?: string;
};

export function ItemHeader({ title, difficulty }: ItemHeader) {
  return (
    <View style={{ flex: 1 }}>
      <AppText style={{ fontWeight: "bold" }}>{title}</AppText>

      {difficulty && (
        <AppText
          style={{
            fontSize: 12,
            color: "#777",
            marginTop: 4,
          }}
        >
          {difficulty}
        </AppText>
      )}
    </View>
  );
}
