import { create } from "zustand";
import { api } from "../api/apiClient";

export type ModuleKey =
  | "habits"
  | "challenges"
  | "todos"
  | "goals"
  | "random"
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

  pendingModuleToggles: number[];

  fetchModules: () => Promise<void>;
  toggleModule: (id: number, value: boolean) => Promise<void>;
  toggleTile: (id: DashboardTileKey, value: boolean) => void;
};


export const useModuleSettingsStore = create<ModuleStore>((set, get) => ({
  modules: null,
  raw: [],
  dashboardTiles: [],
  pendingModuleToggles: [],

 fetchModules: async () => {
    if (get().modules) return;
    const res = await api.get("/settings/modules/?user_id=1");

    const modules: Record<ModuleKey, boolean> = {
      habits: false,
      challenges: false,
      todos: false,
      goals: false,
      random: false,
      gamification: false,
      notes: false,
    };

    res.data.forEach((m: ModuleSetting) => {
      modules[m.module] = m.is_enabled;
    });

    set({ modules, raw: res.data });

    // pobierz tiles z backendu
    try {
      const tRes = await api.get("/settings/dashboard-tiles/?user_id=1");
      set({ dashboardTiles: tRes.data });
    } catch (e) {
      console.warn("Can't load dashboard tiles:", e);
      // fallback: zostaw pustą tablicę lub lokalny default
    }
  },

  

toggleModule: async (id, value) => {
  const prevRaw = get().raw;
  const prevModules = get().modules;
  const changed = prevRaw.find(m => m.id === id);
  // optimistic
  const rawOptimistic = prevRaw.map(m => m.id === id ? { ...m, is_enabled: value } : m);
  const modulesOptimistic = { ...(prevModules as Record<ModuleKey, boolean>) };
  if (changed) modulesOptimistic[changed.module] = value;

  // mark pending
  set({ raw: rawOptimistic, modules: modulesOptimistic, pendingModuleToggles: [...get().pendingModuleToggles, id] });

  try {
    await api.patch(`/settings/modules/${id}/`, { is_enabled: value });
    // success: remove pending
    set({ pendingModuleToggles: get().pendingModuleToggles.filter(x => x !== id) });
  } catch (e) {
    // rollback on error
    set({ raw: prevRaw, modules: prevModules, pendingModuleToggles: get().pendingModuleToggles.filter(x => x !== id) });
    console.error("toggleModule failed", e);
  }
},

  toggleTile: async (id: string, value: boolean) => {
    // zakładamy id jest numericznym pk gdy tiles pobrane z backendu
    const tile = get().dashboardTiles.find((t:any) => t.key === id || t.id === id);
    if (!tile) return;
    try {
      await api.patch(`/settings/dashboard-tiles/${tile.id}/`, { is_enabled: value });
      set({
        dashboardTiles: get().dashboardTiles.map((t:any) =>
          t.id === tile.id ? { ...t, is_enabled: value } : t
        ),
      });
    } catch (e) {
      console.error("toggleTile error", e);
    }
  },
}));
