// frontend/app/stores/useGoalStore.ts

import { create } from "zustand";
import { api } from "../api/apiClient";

export interface GoalPeriod {
  id: number;
  name: string;
  default_xp: number;
}

export interface DifficultyType {
  id: number;
  name: string;
  xp_value: number;
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

  loadGoals: () => Promise<void>;
  loadPeriods: () => Promise<void>;
  loadUserGoals: (userId: number, period?: string) => Promise<void>;
  loadHistory: () => Promise<void>;

  addGoal: (payload: any) => Promise<void>;
  saveGoal: (id: number, payload: any) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  completeGoal: (id: number) => Promise<{ total_xp: number; current_level: number } | null>;
  resetGoals: () => void;
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  periods: [],
  history: [],
  loadingGoals: false,
  loadingPeriods: false,
  loadingHistory: false,

  loadGoals: async () => {
    set({ loadingGoals: true });
    try {
      const res = await api.get<Goal[]>("/goals/");
      set({ goals: res.data });
    } catch (e: any) {
      console.error("Error loading goals:", e.response?.data || e.message || e);
    } finally {
      set({ loadingGoals: false });
    }
  },

  loadPeriods: async () => {
    set({ loadingPeriods: true });
    try {
      const res = await api.get<GoalPeriod[]>("/goals/periods/");
      set({ periods: res.data });
    } catch (e: any) {
      console.error("Error loading periods:", e.response?.data || e.message || e);
    } finally {
      set({ loadingPeriods: false });
    }
  },

  loadUserGoals: async (userId: number, period?: string) => {
    set({ loadingGoals: true });
    try {
      const url = period ? `/goals/user-goals/${userId}/?period=${period}` : `/goals/user-goals/${userId}/`;
      const res = await api.get<Goal[]>(url);
      set({ goals: res.data });
    } catch (e: any) {
      console.error("Error loading user goals:", e.response?.data || e.message || e);
    } finally {
      set({ loadingGoals: false });
    }
  },

  loadHistory: async () => {
    set({ loadingHistory: true });
    try {
      const res = await api.get<GoalHistory[]>("/goals/history/");
      set({ history: res.data });
    } catch (e: any) {
      console.error("Error loading history:", e.response?.data || e.message || e);
    } finally {
      set({ loadingHistory: false });
    }
  },

  addGoal: async (payload: any) => {
    try {
      await api.post("/goals/", payload);
      await get().loadGoals();
    } catch (e: any) {
      console.error("Error adding goal:", e.response?.data || e.message || e);
    }
  },

  saveGoal: async (id: number, payload: any) => {
    try {
      await api.patch(`/goals/${id}/`, payload);
      await get().loadGoals();
    } catch (e: any) {
      console.error("Error saving goal:", e.response?.data || e.message || e);
    }
  },

  deleteGoal: async (id: number) => {
    try {
      await api.delete(`/goals/${id}/`);
      await get().loadGoals();
    } catch (e: any) {
      console.error("Error deleting goal:", e.response?.data || e.message || e);
    }
  },

  completeGoal: async (id: number) => {
    try {
      const res = await api.post(`/goals/${id}/complete/`);
      // odśwież historię i cele
      await get().loadHistory();
      await get().loadGoals();
      return { total_xp: res.data.total_xp, current_level: res.data.current_level };
    } catch (e: any) {
      console.error("Error completing goal:", e.response?.data || e.message || e);
      return null;
    }
  },

  resetGoals: () => set({ goals: [], history: [] }),
}));
