import { create } from "zustand";
import { api } from "../api/apiClient";

export interface Note {
  id: number;
  content: string;
}

interface NotesStore {
  notes: Note[];
  randomNote: Note | null;
  loading: boolean;

  fetchNotes: () => Promise<void>;
  fetchRandomNote: () => Promise<void>;
  fetchById: (id: number) => Promise<Note | null>;

  createNote: (content: string) => Promise<void>;
  updateNote: (id: number, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  randomNote: null,
  loading: false,

  // LIST ALL NOTES
  fetchNotes: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/notes/");
      set({ notes: res.data });
    } catch {
      set({ notes: [] });
    } finally {
      set({ loading: false });
    }
  },

  // RANDOM NOTE
  fetchRandomNote: async () => {
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

  // GET BY ID
  fetchById: async (id: number) => {
    try {
      const res = await api.get(`/notes/${id}/`);
      return res.data;
    } catch {
      return null;
    }
  },

  // CREATE
  createNote: async (content: string) => {
    await api.post("/notes/", { content });

    await get().fetchNotes();
    await get().fetchRandomNote();
  },

  // UPDATE
  updateNote: async (id: number, content: string) => {
    await api.patch(`/notes/${id}/`, { content });

    await get().fetchNotes();
    await get().fetchRandomNote();
  },

  // DELETE
  deleteNote: async (id: number) => {
    await api.delete(`/notes/${id}/`);

    await get().fetchNotes();
    await get().fetchRandomNote();
  },
}));