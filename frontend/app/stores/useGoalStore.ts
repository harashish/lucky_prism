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
  loadGoals: (period?: string) => Promise<void>;
  loadHistory: () => Promise<void>;

  addGoal: (payload: any) => Promise<void>;
  saveGoal: (id: number, payload: any) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  completeGoal: (id: number) => Promise<{
    xp_gained: number;
    total_xp: number;
    current_level: number;
  } | null>;

  pickRandomGoal: (period?: string) => Promise<Goal | null>;

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
    } finally {
      set({ loadingPeriods: false });
    }
  },

  loadGoals: async (period?: string) => {
    set({ loadingGoals: true });
    try {
      const url = period ? `/goals/?period=${period}` : "/goals/";
      const res = await api.get<Goal[]>(url);
      set({ goals: res.data });
    } finally {
      set({ loadingGoals: false });
    }
  },

  loadHistory: async () => {
    set({ loadingHistory: true });
    try {
      const res = await api.get<GoalHistory[]>("/goals/history/");
      set({ history: res.data });
    } finally {
      set({ loadingHistory: false });
    }
  },

  addGoal: async (payload) => {
    await api.post("/goals/", payload);
  },

  saveGoal: async (id, payload) => {
    await api.patch(`/goals/${id}/`, payload);
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}/`);
  },

  completeGoal: async (id) => {
    try {
      const res = await api.post(`/goals/${id}/complete/`);
      return res.data;
    } catch {
      return null;
    }
  },

  pickRandomGoal: async (period?: string) => {
    try {
      const url = period ? `/goals/?period=${period}` : "/goals/";
      const res = await api.get(url);
      const arr = res.data;
      if (!arr?.length) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    } catch (e) {
      console.error("Error picking random goal:", e);
      return null;
    }
  },

  resetGoals: () => set({ goals: [], history: [] }),
}));
