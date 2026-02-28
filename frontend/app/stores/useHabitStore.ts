import { create } from "zustand";
import { api } from "../api/apiClient";
import { notificationEngine } from "../services/notificationEngine";

export interface DifficultyType {
  id: number;
  name: string;
}

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
  difficulty: DifficultyType;
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
  currentMonth?: string;
  difficulties: DifficultyType[];
  biggestStreak: BestHabitStreak | null;

  loading: {
    list: boolean;
    meta: boolean;
    saving: boolean;
    streaks: boolean;
  };

  loadMonth: (
    month?: string,
    opts?: { silent?: boolean }
  ) => Promise<void>;

  loadDifficulties: () => Promise<DifficultyType[]>;
  fetchStreaks: () => Promise<BestHabitStreak | null>;

  createHabit: (payload: any) => Promise<void>;
  updateHabit: (id: number, payload: any) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;

  toggleDay: (
    habitId: number,
    date?: string,
    status?: number
  ) => Promise<ToggleDayResponse | null>;

  getHabitById: (id: number) => Promise<Habit | null>;
  pickRandomHabitSummary: () => Promise<RandomHabitSummary | null>;

  loadHabits: () => Promise<Habit[]>;
}

const initialState = {
  habits: [],
  currentMonth: undefined,
  difficulties: [],
  biggestStreak: null,
  loading: {
    list: false,
    meta: false,
    saving: false,
    streaks: false,
  },
  
};

export const useHabitStore = create<HabitStore>((set, get) => ({
  ...initialState,

  loadMonth: async (
    month?: string,
    opts?: { silent?: boolean }
  ) => {
    const silent = opts?.silent === true;

    if (!silent) {
      set((s) => ({
        loading: { ...s.loading, list: true },
      }));
    }

    try {
      const url = month
        ? `/habits/month/?month=${month}`
        : `/habits/month/`;

      const res = await api.get(url);

      set({
        habits: res.data.habits || [],
        currentMonth: month,
      });
    } catch (e) {
      console.error("loadMonth", e);
    } finally {
      if (!silent) {
        set((s) => ({
          loading: { ...s.loading, list: false },
        }));
      }
    }
  },


  loadDifficulties: async () => {
    set((s) => ({ loading: { ...s.loading, meta: true } }));
    try {
      const res = await api.get<DifficultyType[]>("/common/difficulties/");
      set({ difficulties: res.data });
      return res.data;
    } catch (e) {
      console.error("loadDifficulties", e);
      return [];
    } finally {
      set((s) => ({ loading: { ...s.loading, meta: false } }));
    }
  },

  fetchStreaks: async () => {
    set((s) => ({ loading: { ...s.loading, streaks: true } }));
    try {
      const res = await api.get("/habits/streaks/");
      set({ biggestStreak: res.data });
      return res.data;
    } catch (e) {
      console.error("fetchStreaks", e);
      return null;
    } finally {
      set((s) => ({ loading: { ...s.loading, streaks: false } }));
    }
  },

  createHabit: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/habits/", payload);
      await get().loadMonth(get().currentMonth);
    } catch (e) {
      console.error("createHabit", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  updateHabit: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));

    try {
      await api.patch(`/habits/${id}/`, payload);

      await get().loadMonth(get().currentMonth);

      // 👇 TU DODAJ
      if (payload.reminder_hour !== undefined) {
        if (payload.reminder_hour === null) {
          await notificationEngine.cancel(`habit-${id}`);
        } else {
          const title = payload.title ?? get().habits.find(h => h.id === id)?.title;

          if (payload.reminder_hour !== null && payload.reminder_hour !== undefined) {
            notificationEngine.scheduleHabitReminder(
              id,
              title ?? "Habit",
              payload.reminder_hour,
              payload.reminder_minute ?? 0
            );
          }
        }
      }

    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  deleteHabit: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/habits/${id}/`);
      await get().loadMonth(get().currentMonth);
    } catch (e) {
      console.error("deleteHabit", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  toggleDay: async (habitId, date, status) => {
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
      console.error("toggleDay", e.response?.data || e.message || e);
      return null;
    }
  },

  getHabitById: async (id) => {
    try {
      const res = await api.get(`/habits/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getHabitById", e);
      return null;
    }
  },

  pickRandomHabitSummary: async (): Promise<RandomHabitSummary | null> => {
    try {
      const res = await api.get<RandomHabitSummary | null>("/habits/random/");
      return res.data ?? null;
    } catch (e) {
      console.error("pickRandomHabitSummary", e);
      return null;
    }
  },

  loadHabits: async () => {
  try {
    const res = await api.get<Habit[]>("/habits/");
    set({ habits: res.data });
    return res.data;
  } catch (e) {
    console.error("loadHabits", e);
    return [];
  }
},

}));
