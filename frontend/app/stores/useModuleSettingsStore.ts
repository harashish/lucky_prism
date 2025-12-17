import { create } from "zustand";
import { api } from "../api/apiClient";

export type ModuleKey =
  | "habits"
  | "challenges"
  | "todos"
  | "goals"
  | "randomizer"
  | "gamification"
  | "notes";

  export type DashboardTileKey =
  | "level_gamification"
  | "biggest_streak"
  | "random_habit"
  | "random_todo"
  | "goal_week"
  | "goal_month"
  | "goal_year"
  | "daily_challenge"
  | "weekly_challenge"
  | "random_note";

type DashboardTileSetting = {
  id: DashboardTileKey;
  name: string;
  is_enabled: boolean;
  module_dependency?: ModuleKey; // jeśli tile zależy od modułu
};



type ModuleSetting = {
  id: number;
  module: ModuleKey;
  is_enabled: boolean;
};

type ModuleStore = {
  modules: Record<ModuleKey, boolean> | null;
  raw: ModuleSetting[];
  dashboardTiles: DashboardTileSetting[];
  fetchModules: () => Promise<void>;
  toggleModule: (id: number, value: boolean) => Promise<void>;
  toggleTile: (id: DashboardTileKey, value: boolean) => void;
};

export const useModuleSettingsStore = create<ModuleStore>((set, get) => ({
  modules: null,
  raw: [],
  dashboardTiles: [
    { id: "level_gamification", name: "Level gamification", is_enabled: true, module_dependency: "gamification" },
    { id: "biggest_streak", name: "Biggest streak", is_enabled: true, module_dependency: "habits" },
    { id: "random_habit", name: "Random habit", is_enabled: true, module_dependency: "habits" },
    { id: "random_todo", name: "Random todo", is_enabled: true, module_dependency: "todos" },
    { id: "goal_week", name: "Week goal", is_enabled: true, module_dependency: "goals" },
    { id: "goal_month", name: "Month goal", is_enabled: true, module_dependency: "goals" },
    { id: "goal_year", name: "Year goal", is_enabled: true, module_dependency: "goals" },
    { id: "daily_challenge", name: "Daily challenge", is_enabled: true, module_dependency: "challenges" },
    { id: "weekly_challenge", name: "Weekly challenge", is_enabled: true, module_dependency: "challenges" },
    { id: "random_note", name: "Random note", is_enabled: true, module_dependency: "notes" },
  ],

  fetchModules: async () => {
    if (get().modules) return; // fetch tylko raz
    const res = await api.get("/settings/modules/?user_id=1");

    const modules: Record<ModuleKey, boolean> = {
      habits: false,
      challenges: false,
      todos: false,
      goals: false,
      randomizer: false,
      gamification: false,
      notes: false,
    };

    res.data.forEach((m: ModuleSetting) => {
      modules[m.module] = m.is_enabled;
    });

    set({ modules, raw: res.data });
  },

  toggleModule: async (id, value) => {
    await api.patch(`/settings/modules/${id}/`, { is_enabled: value });

    const raw = get().raw.map((m) =>
      m.id === id ? { ...m, is_enabled: value } : m
    );

    const modules = { ...(get().modules as Record<ModuleKey, boolean>) };
    const changed = raw.find((m) => m.id === id);
    if (changed) modules[changed.module] = value;

    set({ raw, modules });

    // Wyłączamy dashboard tiles zależne od tego modułu
    set({
      dashboardTiles: get().dashboardTiles.map((tile) =>
        tile.module_dependency === changed?.module && !value
          ? { ...tile, is_enabled: false }
          : tile
      ),
    });
  },

  toggleTile: (id, value) => {
    set({
      dashboardTiles: get().dashboardTiles.map((tile) =>
        tile.id === id ? { ...tile, is_enabled: value } : tile
      ),
    });
  },
}));
