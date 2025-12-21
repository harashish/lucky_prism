import { create } from "zustand";
import { api } from "../api/apiClient";

export interface GoalPeriod {
  id: number;
  name: string;
}

export interface DifficultyType {
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
  user: number;
  created_at?: string;
  updated_at?: string;
}

export interface GoalHistory {
  id: number;
  goal: number;
  completion_date: string;
  xp_gained: number;
}

interface GoalStore {
  goals: Goal[];
  periods: GoalPeriod[];
  history: GoalHistory[];

  loadingGoals: boolean;
  loadingPeriods: boolean;
  loadingHistory: boolean;

  loadPeriods: () => Promise<void>;
  loadUserGoals: (userId: number, period?: string) => Promise<void>;
  loadHistory: () => Promise<void>;

  addGoal: (payload: any) => Promise<void>;
  saveGoal: (id: number, payload: any) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  completeGoal: (id: number) => Promise<{
    xp_gained: number;
    total_xp: number;
    current_level: number;
  } | null>;

  resetGoals: () => void;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  periods: [],
  history: [],

  loadingGoals: false,
  loadingPeriods: false,
  loadingHistory: false,

  loadPeriods: async () => {
    set({ loadingPeriods: true });
    try {
      const res = await api.get<GoalPeriod[]>("/goals/periods/");
      set({ periods: res.data });
    } catch (e) {
      console.error("loadPeriods", e);
    } finally {
      set({ loadingPeriods: false });
    }
  },

  loadUserGoals: async (userId: number, period?: string) => {
    set({ loadingGoals: true });
    try {
      const url = period
        ? `/goals/user-goals/${userId}/?period=${period}`
        : `/goals/user-goals/${userId}/`;

      const res = await api.get<Goal[]>(url);
      set({ goals: res.data });
    } catch (e) {
      console.error("loadUserGoals", e);
    } finally {
      set({ loadingGoals: false });
    }
  },

  loadHistory: async () => {
    set({ loadingHistory: true });
    try {
      const res = await api.get<GoalHistory[]>("/goals/history/");
      set({ history: res.data });
    } catch (e) {
      console.error("loadHistory", e);
    } finally {
      set({ loadingHistory: false });
    }
  },

  addGoal: async (payload) => {
    try {
      await api.post("/goals/", payload);
    } catch (e) {
      console.error("addGoal", e);
    }
  },

  saveGoal: async (id, payload) => {
    try {
      await api.patch(`/goals/${id}/`, payload);
    } catch (e) {
      console.error("saveGoal", e);
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}/`);
    } catch (e) {
      console.error("deleteGoal", e);
    }
  },

  completeGoal: async (id) => {
    try {
      const res = await api.post(`/goals/${id}/complete/`);
      return res.data;
    } catch (e) {
      console.error("completeGoal", e);
      return null;
    }
  },

  resetGoals: () => set({ goals: [], history: [] }),
}));
