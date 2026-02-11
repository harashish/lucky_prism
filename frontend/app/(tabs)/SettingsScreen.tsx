import { View, Switch, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import { useModuleSettingsStore } from "../stores/useModuleSettingsStore";
import { colors, spacing } from "../../constants/theme";
import { ScrollView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { useGamificationStore } from "../stores/useGamificationStore";
import {
  BASE_XP,
  MODULE_MULTIPLIER,
  CHALLENGE_PERIOD_MULTIPLIER,
  GOAL_PERIOD_MULTIPLIER,
} from "../../constants/xpPreview";
import { calcXpPreview } from "../../utils/calcXpPreview";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { api } from "../api/apiClient";


export default function SettingsScreen() {
const { raw, modules, dashboardTiles, toggleModule, toggleTile, pendingModuleToggles, fetchModules } =
  useModuleSettingsStore();

  useEffect(() => {
  fetchModules();
}, []);

  const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

  const { xpMultiplier, setXpMultiplier } = useGamificationStore();

const handleExport = async () => {
  try {
    const res = await api.get("/settings/export/");
    const data = res.data;

    const fileUri = FileSystem.documentDirectory + "backup.json";

    await FileSystem.writeAsStringAsync(
      fileUri,
      JSON.stringify(data)
    );

    await Sharing.shareAsync(fileUri);
  } catch (e) {
    console.log("Export error:", e);
  }
};

const handleImport = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
    });

    if (result.canceled) return;

    const fileContent = await FileSystem.readAsStringAsync(
      result.assets[0].uri
    );

    await api.post("/settings/import/", JSON.parse(fileContent));

    alert("Import finished. Restart app.");
  } catch (e) {
    console.log("Import error:", e);
  }
};

  const XP_TABLE_CONFIG: XpTableRow[] = [
    { label: "Habits", module: "habits" },
    { label: "Todos", module: "todos" },

    {
      label: "Challenges (daily)",
      module: "challenges",
      periodMultiplier: CHALLENGE_PERIOD_MULTIPLIER.daily,
    },
    {
      label: "Challenges (weekly)",
      module: "challenges",
      periodMultiplier: CHALLENGE_PERIOD_MULTIPLIER.weekly,
    },

    {
      label: "Goals (weekly)",
      module: "goals",
      periodMultiplier: GOAL_PERIOD_MULTIPLIER.weekly,
    },
    {
      label: "Goals (monthly)",
      module: "goals",
      periodMultiplier: GOAL_PERIOD_MULTIPLIER.monthly,
    },
    {
      label: "Goals (yearly)",
      module: "goals",
      periodMultiplier: GOAL_PERIOD_MULTIPLIER.yearly,
    },
  ];

  type XpTableRow = {
    label: string;
    module: "habits" | "todos" | "challenges" | "goals";
    periodMultiplier?: number;
  };

  return (
    <ScrollView style={{ flex: 1, padding: spacing.l, backgroundColor: colors.background  }} contentContainerStyle={{
    paddingBottom: 30,
  }} >
      
      <AppText style={{ fontWeight: "700", marginBottom: 10 }}>Modules</AppText>
      {raw.map((m) => (
        <View key={m.id} style={styles.row}>
          <AppText>{capitalize(m.module)}</AppText>
          <Switch
            value={m.is_enabled}
            onValueChange={(v) => toggleModule(m.id, v)}
            trackColor={{ 
                false: colors.card, 
                true: colors.buttonActive 
              }}
            disabled={pendingModuleToggles.includes(m.id)}
            thumbColor={colors.light}
          />
        </View>
      ))}

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
                false: colors.card,
                true: colors.buttonActive
              }}
              thumbColor={colors.light}

            />
          </View>
      ))}

        <AppText style={{ fontWeight: "700", marginVertical: 10 }}>XP multiplier</AppText>
        <View style={{ flexDirection: "row", gap: 10 }}>
        {[0.5, 1, 1.5, 2].map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setXpMultiplier(v)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              backgroundColor:
                xpMultiplier === v ? colors.buttonActive : colors.card,
            }}
          >
            <AppText style={{ color: colors.text }}>x{v}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText style={{ fontWeight: "700", marginTop: spacing.l }}>
        XP breakdown
      </AppText>

      <View style={styles.table}>
        <View style={styles.headerRow}>
          <View style={styles.cellModule}>
            <AppText style={{ fontWeight: "600" }}>Module</AppText>
          </View>
          <View style={styles.cellXp}>
            <AppText style={{ fontWeight: "600" }}>Easy</AppText>
          </View>
          <View style={styles.cellXp}>
            <AppText style={{ fontWeight: "600" }}>Medium</AppText>
          </View>
          <View style={styles.cellXp}>
            <AppText style={{ fontWeight: "600" }}>Hard</AppText>
          </View>
        </View>

      {XP_TABLE_CONFIG.map((tableRow) => (
        <View key={tableRow.label} style={styles.tableRow}>
          <View style={styles.cellModule}>
            <AppText>{tableRow.label}</AppText>
          </View>

          {(["easy", "medium", "hard"] as const).map((diff) => (
            <View key={diff} style={styles.cellXp}>
              <AppText>
                {calcXpPreview({
                  baseXp: BASE_XP[diff],
                  moduleMultiplier: MODULE_MULTIPLIER[tableRow.module],
                  periodMultiplier: tableRow.periodMultiplier ?? 1,
                  xpMultiplier,
                })}
              </AppText>
            </View>
          ))}
        </View>
      ))}

      </View>

<AppText style={{ fontWeight: "700", marginTop: spacing.l }}>
  Backup
</AppText>

<View style={{ flexDirection: "row", gap: 12, marginTop: spacing.s }}>
  <TouchableOpacity
    onPress={handleExport}
    style={{
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      alignItems: "center",
    }}
  >
    <AppText>Export data</AppText>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={handleImport}
    style={{
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      alignItems: "center",
    }}
  >
    <AppText>Import data</AppText>
  </TouchableOpacity>
</View>

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
  table: {
    borderWidth: 1,
    borderColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: spacing.s,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },

  cellModule: { flex: 2 },
  cellXp: { flex: 1, alignItems: "flex-end" },

});
