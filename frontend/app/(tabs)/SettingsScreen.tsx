import { View, Switch, StyleSheet } from "react-native";
import AppText from "../../components/AppText";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { colors, spacing } from "../../constants/theme";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingsScreen() {
 const { raw, modules, dashboardTiles, toggleModule, toggleTile, pendingModuleToggles } = useModuleSettingsStore();

  return (
    <ScrollView style={{ flex: 1, padding: spacing.l, backgroundColor: colors.background  }} contentContainerStyle={{
    paddingBottom: 30,
  }} >
      
      {/* MODULES */}
      <AppText style={{ fontWeight: "700", marginBottom: 10 }}>Modules</AppText>
      {raw.map((m) => (
        <View key={m.id} style={styles.row}>
          <AppText>{m.module}</AppText>
          <Switch
            value={m.is_enabled}
            onValueChange={(v) => toggleModule(m.id, v)}
            trackColor={{ 
                false: colors.card, 
                true: colors.buttonActive 
              }}
            disabled={pendingModuleToggles.includes(m.id)} // <- blokada podczas requestu
            thumbColor={colors.light}
          />
        </View>
      ))}

      {/* DASHBOARD TILES */}
      <AppText style={{ fontWeight: "700", marginVertical: 10 }}>Dashboard tiles</AppText>
      {dashboardTiles
        .filter(tile => !tile.module_dependency || modules?.[tile.module_dependency])
        .map((tile) => (
          <View key={tile.id} style={styles.row}>
            <AppText>{tile.name}</AppText>
            <Switch
              value={tile.is_enabled}
              onValueChange={(v) => toggleTile(tile.key, v)}
              trackColor={{ 
                false: colors.card, // Kolor tła, gdy wyłączony
                true: colors.buttonActive // Kolor tła, gdy włączony 
              }}
              thumbColor={colors.light}

            />
          </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.l,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.m,
  },
});
