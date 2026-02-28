import { create } from "zustand";
import { api } from "../api/apiClient";
import { notificationEngine } from "../services/notificationEngine";

export interface Note {
  id: number;
  content: string;
  reminder_hour?: number | null;
  reminder_minute?: number | null;
}

interface NotesStore {
  notes: Note[];
  randomNote: Note | null;
  loading: boolean;

  fetchNotes: () => Promise<void>;
  fetchRandomNote: () => Promise<void>;
  fetchById: (id: number) => Promise<Note | null>;

  createNote: (
  content: string,
  reminderHour?: number | null,
  reminderMinute?: number
) => Promise<void>;
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
createNote: async (
  content: string,
  reminderHour?: number | null,
  reminderMinute = 0
) => {
  const res = await api.post("/notes/", {
    content,
    reminder_hour: reminderHour,
    reminder_minute: reminderHour ? reminderMinute : null,
  });

  const note = res.data;

  await get().fetchNotes();
  await get().fetchRandomNote();

  // schedule reminder jeśli istnieje
  if (note.reminder_hour !== null && note.reminder_hour !== undefined) {
    await notificationEngine.scheduleNoteReminder(
      note.id,
      note.content,
      note.reminder_hour,
      note.reminder_minute ?? 0
    );
  }
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

    await notificationEngine.cancel(`note-${id}`);

    await get().fetchNotes();
    await get().fetchRandomNote();
  },
}));