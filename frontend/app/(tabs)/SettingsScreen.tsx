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
import { useRouter } from "expo-router";
import { useUserPreferencesStore } from "../stores/useUserPreferenceStore";
import { useTodoStore } from "../stores/useTodoStore";
import React from "react";

const MODULE_ROUTE_MAP: Record<string, string> = {
  habits: "/HabitsScreen",
  todos: "/TodosScreen",
  goals: "/GoalsScreen",
  challenges: "/ChallengesScreen",
  mood: "/MoodScreen",
  sobriety: "/SobrietyScreen",
  gamification: "/GamificationScreen",
  random: "/RandomScreen",
};

export default function SettingsScreen() {
const router = useRouter();


const { raw, modules, dashboardTiles, toggleModule, toggleTile, pendingModuleToggles, fetchModules } =
  useModuleSettingsStore();

  useEffect(() => {
    fetchPreferences();
    fetchModules();
}, []);

  const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1);

  const { xpMultiplier, setXpMultiplier } = useGamificationStore();

  const { categories, loadCategories } = useTodoStore();
  const {
    defaultTodoCategoryId,
    setDefaultTodoCategoryId,
  } = useUserPreferencesStore();

  const [openSections, setOpenSections] = React.useState({
    modules: false,
    dashboard: false,
    xpMultiplier: false,
    xpBreakdown: false,
    todos: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
  setOpenSections(prev => ({
    ...prev,
    [key]: !prev[key],
  }));
};

useEffect(() => {
  loadCategories();
}, []);

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


  const {
    hideQuickAddDifficulty,
    fetchPreferences,
    setHideQuickAddDifficulty,
    hideTodoCompletedToggle,
    setHideTodoCompletedToggle,
  } = useUserPreferencesStore();

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


    <AppText style={{ fontWeight: "700", marginTop: spacing.l }}>
      Go to module
    </AppText>

    {raw.map((m) => {
      const route = MODULE_ROUTE_MAP[m.module];

      if (!route) return null; // bezpieczeństwo

      return (
        <TouchableOpacity
          key={m.id}
          onPress={() => router.push(route)}
          style={{
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: colors.card,
          }}
        >
          <AppText>{capitalize(m.module)}</AppText>
        </TouchableOpacity>
        
      );
    })}
    <TouchableOpacity
  onPress={() => router.push("/notes")}
  style={{
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.card,
  }}
>
  <AppText>Notes</AppText>
</TouchableOpacity>
      
      <View style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection("modules")}>
          <AppText style={{ fontWeight: "700"}}>
            Modules {openSections.modules ? "▲" : "▼"}
          </AppText>
        </TouchableOpacity>
      

{openSections.modules && (
  <>
    {raw.map((m) => (
      <View key={m.id} style={styles.row}>
        <AppText>{capitalize(m.module)}</AppText>
        <Switch
          value={m.is_enabled}
          onValueChange={(v) => toggleModule(m.id, v)}
          trackColor={{
            false: colors.card,
            true: colors.buttonActive,
          }}
          disabled={pendingModuleToggles.includes(m.id)}
          thumbColor={colors.light}
        />
      </View>
    ))}
  </>
)}
</View>
      <TouchableOpacity onPress={() => toggleSection("dashboard")}>
        <AppText style={{ fontWeight: "700", marginVertical: 10 }}>
          Dashboard tiles {openSections.dashboard ? "▲" : "▼"}
        </AppText>
      </TouchableOpacity>
      {openSections.dashboard && (
  <>
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
              true: colors.buttonActive,
            }}
            thumbColor={colors.light}
          />
        </View>
      ))}
  </>
)}

        <TouchableOpacity onPress={() => toggleSection("xpMultiplier")}>
          <AppText style={{ fontWeight: "700", marginVertical: 10 }}>
            XP multiplier {openSections.xpMultiplier ? "▲" : "▼"}
          </AppText>
        </TouchableOpacity>
        {openSections.xpMultiplier && (
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
      )}

      <TouchableOpacity onPress={() => toggleSection("xpBreakdown")}>
        <AppText style={{ fontWeight: "700", marginTop: spacing.l }}>
          XP breakdown {openSections.xpBreakdown ? "▲" : "▼"}
        </AppText>
      </TouchableOpacity>
      {openSections.xpBreakdown && (
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

      </View>)}

    <TouchableOpacity onPress={() => toggleSection("todos")}>
  <AppText style={{ fontWeight: "700", marginVertical: 10 }}>
    Todos {openSections.todos ? "▲" : "▼"}
  </AppText>
</TouchableOpacity>

{openSections.todos && (
  <>
    <View style={styles.row}>
      <AppText>Hide quick add difficulty button</AppText>
      <Switch
        value={hideQuickAddDifficulty}
        onValueChange={setHideQuickAddDifficulty}
        trackColor={{
          false: colors.card,
          true: colors.buttonActive,
        }}
        thumbColor={colors.light}
      />
    </View>

    <View style={styles.row}>
      <AppText>Hide completed toggle button</AppText>
      <Switch
        value={hideTodoCompletedToggle}
        onValueChange={setHideTodoCompletedToggle}
        trackColor={{ false: colors.card, true: colors.buttonActive }}
        thumbColor={colors.light}
      />
    </View>

    <View style={{ marginTop: 10 }}>
      <AppText style={{ marginBottom: 6 }}>
        Default todo category
      </AppText>

      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          onPress={() => setDefaultTodoCategoryId(cat.id)}
          style={{
            paddingVertical: 8,
            opacity: defaultTodoCategoryId === cat.id ? 1 : 0.5,
          }}
        >
          <AppText>
            {defaultTodoCategoryId === cat.id ? "★ " : ""}
            {cat.name}
          </AppText>
        </TouchableOpacity>
      ))}

      {defaultTodoCategoryId && (
        <TouchableOpacity
          onPress={() => setDefaultTodoCategoryId(null)}
          style={{ marginTop: 8 }}
        >
          <AppText style={{ color: "#888" }}>
            Clear default
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  </>
)}
    


<AppText style={{ fontWeight: "700", marginTop: spacing.l }}>
  Progress
</AppText>

<TouchableOpacity
  onPress={() => router.push("/achievements")}
  style={{
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.card,
  }}
>
  <AppText>Achievements</AppText>
</TouchableOpacity>      

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
  section: {
    marginTop: spacing.l,
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
