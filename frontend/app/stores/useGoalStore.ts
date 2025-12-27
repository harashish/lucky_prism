import { create } from "zustand";
import { api } from "../api/apiClient";

/* ---------- TYPES ---------- */

export interface DifficultyType {
  id: number;
  name: string;
}

export interface GoalPeriod {
  id: number;
  name: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  motivation_reason?: string;
  period: GoalPeriod;
  difficulty: DifficultyType;
  is_completed: boolean;
  completed_at?: string | null;
}

/* ---------- STORE ---------- */

interface GoalStore {
  goals: Goal[];
  periods: GoalPeriod[];

  currentPeriod?: string;

  loading: {
    list: boolean;      // goals
    periods: boolean;
    meta: boolean;      // difficulties
    saving: boolean;    // create/update/delete
  };

  /* --- load --- */
  loadPeriods: () => Promise<void>;
  loadGoals: (period?: string) => Promise<void>;
  loadDifficulties: () => Promise<DifficultyType[]>;

  /* --- crud --- */
  createGoal: (payload: any) => Promise<boolean>;
  saveGoal: (id: number, payload: any) => Promise<boolean>;
  deleteGoal: (id: number) => Promise<boolean>;


  /* --- actions --- */
  completeGoal: (id: number) => Promise<{
    xp_gained: number;
    total_xp: number;
    current_level: number;
  } | null>;

  /* --- helpers --- */
  pickRandomGoal: (period?: string) => Promise<Goal | null>;
  getGoalById: (id: number) => Promise<Goal | null>;

}

/* ---------- INITIAL STATE ---------- */

const initialState = {
  goals: [],
  periods: [],
  currentPeriod: undefined,
  loading: {
    list: false,
    periods: false,
    meta: false,
    saving: false,
  },
};

/* ---------- IMPLEMENTATION ---------- */

export const useGoalStore = create<GoalStore>((set, get) => ({
  ...initialState,

  /* ---------- LOAD ---------- */

  loadPeriods: async () => {
    set((s) => ({ loading: { ...s.loading, periods: true } }));
    try {
      const res = await api.get<GoalPeriod[]>("/goals/periods/");
      set({ periods: res.data });
    } catch (e) {
      console.error("loadPeriods", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, periods: false } }));
    }
  },

  loadGoals: async (period) => {
    set((s) => ({ loading: { ...s.loading, list: true } }));
    try {
      const url = period ? `/goals/?period=${period}` : "/goals/";
      const res = await api.get<Goal[]>(url);

      set({
        goals: res.data,
        currentPeriod: period,
      });
    } catch (e) {
      console.error("loadGoals", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, list: false } }));
    }
  },


  loadDifficulties: async () => {
    set((s) => ({ loading: { ...s.loading, meta: true } }));
    try {
      const res = await api.get<DifficultyType[]>("/common/difficulties/");
      return res.data;
    } catch (e) {
      console.error("loadDifficulties", e);
      return [];
    } finally {
      set((s) => ({ loading: { ...s.loading, meta: false } }));
    }
  },

  /* ---------- CRUD ---------- */

  createGoal: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/goals/", payload);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("createGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },


  saveGoal: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/goals/${id}/`, payload);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("saveGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },


  deleteGoal: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/goals/${id}/`);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("deleteGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },


  /* ---------- ACTIONS ---------- */

  completeGoal: async (id) => {
    try {
      const res = await api.post(`/goals/${id}/complete/`);
      return res.data;
    } catch (e) {
      console.error("completeGoal", e);
      return null;
    }
  },

  /* ---------- HELPERS ---------- */

  getGoalById: async (id) => {
    try {
      const res = await api.get(`/goals/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getGoalById", e);
      return null;
    }
  },

  pickRandomGoal: async (period?: string) => {
    try {
      const url = period ? `/goals/random/?period=${period}` : "/goals/random/";
      const res = await api.get<Goal | null>(url);
      return res.data; // backend zwraca null lub serialized Goal
    } catch (e) {
      console.error("pickRandomGoal", e);
      return null;
    }
  },

}));
