import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../../constants/theme";
import AppText from "../../components/AppText";

export default function RandomSpin({ items, onFinish }: { items: string[]; onFinish: (pickedIndex:number)=>void }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let ticks = 0;
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
      ticks++;
      if (ticks >= 12) {
        clearInterval(interval);
        const picked = Math.floor(Math.random() * items.length);
        onFinish(picked);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <AppText style={styles.text}>{items[index]}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", flex: 1 },
  card: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.light,
    backgroundColor: colors.card,
    maxWidth: "90%",
  },
  text: { fontSize: 22, fontWeight: "800", textAlign: "center" },
});
