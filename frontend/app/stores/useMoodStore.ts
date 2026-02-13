import { create } from "zustand";
import { api } from "../api/apiClient";

/*
========================
TYPES
========================
*/

// dynamiczne — backend kontroluje
export type MoodType = string;

export type MoodOption = {
  value: string;
  label: string;
};

export type MoodEntry = {
  id: number;
  mood: MoodType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  note: string;
};

/*
========================
STATE
========================
*/

type MoodState = {
  entries: MoodEntry[];

  // dostępne typy moodów z backendu
  moodTypes: MoodOption[];

  fetchYear: (year: number) => Promise<void>;
  loadMoodTypes: () => Promise<void>;

  addMood: (data: Partial<MoodEntry>) => Promise<void>;
  updateMood: (id: number, data: Partial<MoodEntry>) => Promise<void>;
  deleteMood: (id: number) => Promise<void>;
};

/*
========================
STORE
========================
*/

export const useMoodStore = create<MoodState>((set, get) => ({
  entries: [],
  moodTypes: [],

  /*
  ========================
  FETCH YEAR
  ========================
  */

  fetchYear: async (year) => {
    try {
      const res = await api.get(`/mood/?year=${year}`);
      set({ entries: res.data });
    } catch (e) {
      console.error("fetchYear", e);
    }
  },

  /*
  ========================
  LOAD MOOD TYPES
  ========================
  */

  loadMoodTypes: async () => {
    try {
      const res = await api.get("/mood/types/");
      set({ moodTypes: res.data });
    } catch (e) {
      console.error("loadMoodTypes", e);
    }
  },

  /*
  ========================
  CREATE
  ========================
  */

  addMood: async (data) => {
    try {
      const res = await api.post("/mood/", data);

      set((state) => ({
        entries: [...state.entries, res.data],
      }));
    } catch (e) {
      console.error("addMood", e);
      throw e;
    }
  },

  /*
  ========================
  UPDATE
  ========================
  */

  updateMood: async (id, data) => {
    try {
      const res = await api.patch(`/mood/${id}/`, data);

      set((state) => ({
        entries: state.entries.map((e) =>
          e.id === id ? res.data : e
        ),
      }));
    } catch (e) {
      console.error("updateMood", e);
      throw e;
    }
  },

  /*
  ========================
  DELETE
  ========================
  */

  deleteMood: async (id) => {
    try {
      await api.delete(`/mood/${id}/`);

      set((state) => ({
        entries: state.entries.filter((e) => e.id !== id),
      }));
    } catch (e) {
      console.error("deleteMood", e);
      throw e;
    }
  },
}));

