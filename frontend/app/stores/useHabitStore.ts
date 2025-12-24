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

export interface BestHabitStreak {
  habit_id: number | null;
  title: string | null;
  biggest_streak: number;
  current_streak: number;
}

export interface RandomHabitSummary {
  id: number;
  title: string;
  reason?: string;
  done: number;
  total: number;
}


interface HabitStore {
  habits: Habit[];
  loading: boolean;
  difficulties: { id: number; name: string; xp_value: number }[];
  biggestStreak: BestHabitStreak | null;

  loadMonth: (month?: string) => Promise<void>;
  loadDifficulties: () => Promise<void>;

  createHabit: (payload: any) => Promise<void>;
  updateHabit: (id: number, payload: any) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;

  toggleDay: (
    habitId: number,
    date?: string,
    status?: number
  ) => Promise<ToggleDayResponse | null>;

  getRandomHabitSummary: () => RandomHabitSummary | null;

  fetchStreaks: () => Promise<BestHabitStreak | null>;

  resetHabits: () => void;
}
export const useHabitStore = create<HabitStore>((set, get) => ({

  habits: [],
  loading: false,
  difficulties: [],
  biggestStreak: null,

  loadMonth: async (month?: string) => {
    set({ loading: true });
    try {
      const url = month
        ? `/habits/month/?month=${month}`
        : `/habits/month/`;

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

  fetchStreaks: async () => {
    try {
      const res = await api.get("/habits/streaks/");
      set({ biggestStreak: res.data });
      return res.data;
    } catch (e) {
      console.error("Error fetching habit streaks:", e);
      return null;
    }
  },

  getRandomHabitSummary: () => {
    const habits = get().habits;

    if (!habits || habits.length === 0) return null;

    const h = habits[Math.floor(Math.random() * habits.length)];

    const done =
      h.days?.filter((d) => d.status === 2).length ?? 0;

    const total = h.days?.length ?? 0;

    return {
      id: h.id,
      title: h.title,
      reason: h.motivation_reason,
      done,
      total,
    };
  },

  resetHabits: () => set({ habits: [] }),
}));
