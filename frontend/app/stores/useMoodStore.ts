import { create } from "zustand";
import { api } from "../api/apiClient";

export type MoodType =
  | "great"
  | "good"
  | "neutral"
  | "bad"
  | "terrible";

export type MoodEntry = {
  id: number;
  mood: MoodType;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM:SS
  note: string;
};

type MoodState = {
  entries: MoodEntry[];
  fetchYear: (year: number) => Promise<void>;
  addMood: (data: Partial<MoodEntry>) => Promise<void>;
  updateMood: (id: number, data: Partial<MoodEntry>) => Promise<void>;
  deleteMood: (id: number) => Promise<void>;
};

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],

  fetchYear: async (year) => {
    const res = await api.get(`/mood/?year=${year}`);
    set({ entries: res.data });
  },

    addMood: async (data) => {
    const res = await api.post("/mood/", data);

    set((state) => ({
        entries: [...state.entries, res.data],
    }));
    },

    updateMood: async (id, data) => {
    const res = await api.patch(`/mood/${id}/`, data);

    set((state) => ({
        entries: state.entries.map((e) =>
        e.id === id ? res.data : e
        ),
    }));
    },

  deleteMood: async (id) => {
    await api.delete(`/mood/${id}/`);
  },
}));