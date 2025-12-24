import { create } from "zustand";
import { api } from "../api/apiClient";

interface Note {
  id: number;
  content: string;
}

interface NotesStore {
  randomNote: Note | null;
  loading: boolean;

  fetchRandom: () => Promise<void>;
  fetchById: (id: number) => Promise<Note | null>;

  createNote: (content: string) => Promise<void>;
  updateNote: (id: number, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set) => ({
  randomNote: null,
  loading: false,

  fetchRandom: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/notes/random/");
      set({ randomNote: res.data });
    } catch {
      set({ randomNote: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchById: async (id: number) => {
    try {
      const res = await api.get(`/notes/${id}/`);
      return res.data;
    } catch {
      return null;
    }
  },

  createNote: async (content: string) => {
    await api.post("/notes/", { content });
    await useNotesStore.getState().fetchRandom();
  },

  updateNote: async (id: number, content: string) => {
    await api.patch(`/notes/${id}/`, { content });
    await useNotesStore.getState().fetchRandom();
  },

  deleteNote: async (id: number) => {
    await api.delete(`/notes/${id}/`);
    await useNotesStore.getState().fetchRandom();
  },
}));

