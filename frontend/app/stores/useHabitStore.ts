import { create } from "zustand";
import { api } from "../api/apiClient";

export interface HabitDay {
  date: string;
  status: number;
  xp_awarded?: boolean;
}

export interface Habit {
  id: number;
  title: string;
  description?: string;
  motivation_reason?: string;
  color?: string;
  difficulty: { id: number; name: string; xp_value: number };
  user: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  days?: HabitDay[];
}

interface ToggleDayResponse {
  xp_gained: number;
  total_xp: number;
  current_level: number;
  already_completed?: boolean;
  day?: any;
}


interface HabitStore {
  habits: Habit[];
  loading: boolean;
  difficulties: { id: number; name: string; xp_value: number }[];

  loadMonth: (userId: number, month?: string) => Promise<void>;
  loadDifficulties: () => Promise<void>;

  createHabit: (payload: any) => Promise<void>;
  updateHabit: (id: number, payload: any) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;

  toggleDay: (
    habitId: number,
    date?: string,
    status?: number
  ) => Promise<ToggleDayResponse | null>;

  resetHabits: () => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  loading: false,
  difficulties: [],

  loadMonth: async (userId: number, month?: string) => {
    set({ loading: true });
    try {
      const url = month
        ? `/habits/user-habits/${userId}/month/?month=${month}`
        : `/habits/user-habits/${userId}/month/`;

      const res = await api.get(url);
      set({ habits: res.data.habits || [] });
    } catch (e: any) {
      console.error(
        "Error loading habits month:",
        e.response?.data || e.message || e
      );
    } finally {
      set({ loading: false });
    }
  },

  loadDifficulties: async () => {
    try {
      const res = await api.get("/common/difficulties/");
      set({ difficulties: res.data });
    } catch (e: any) {
      console.error(
        "Error loading difficulties:",
        e.response?.data || e.message || e
      );
    }
  },

  createHabit: async (payload: any) => {
    try {
      await api.post("/habits/", payload);
    } catch (e: any) {
      console.error(
        "Error creating habit:",
        e.response?.data || e.message || e
      );
      throw e;
    }
  },

  updateHabit: async (id: number, payload: any) => {
    try {
      await api.patch(`/habits/${id}/`, payload);
    } catch (e: any) {
      console.error(
        "Error updating habit:",
        e.response?.data || e.message || e
      );
      throw e;
    }
  },

  deleteHabit: async (id: number) => {
    try {
      await api.delete(`/habits/${id}/`);
    } catch (e: any) {
      console.error(
        "Error deleting habit:",
        e.response?.data || e.message || e
      );
      throw e;
    }
  },

  toggleDay: async (habitId: number, date?: string, status?: number) => {
    try {
      const payload: any = {};
      if (date) payload.date = date;
      if (typeof status !== "undefined") payload.status = status;

      const res = await api.post(
        `/habits/${habitId}/toggle-day/`,
        payload
      );

      return res.data as ToggleDayResponse;
    } catch (e: any) {
      console.error(
        "Error toggling habit day:",
        e.response?.data || e.message || e
      );
      return null;
    }
  },


  resetHabits: () => set({ habits: [] }),
}));
