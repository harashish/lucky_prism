import { create } from "zustand";
import { api } from "../api/apiClient";

export interface SobrietyRelapse {
  id: number;
  sobriety: number;
  occurred_at: string;
  note?: string;
}

export interface Sobriety {
  id: number;
  name: string;
  description?: string;
  motivation_reason: string;

  started_at: string;
  ended_at?: string | null;
  is_active: boolean;

  created_at: string;
  updated_at: string;

  current_duration: number | null; // seconds
  relapses: SobrietyRelapse[];
}

interface SobrietyStore {
  sobrietyList: Sobriety[];
  loading: boolean;

  loadSobriety: (silent?: boolean) => Promise<void>;
  getSobrietyById: (id: number) => Promise<Sobriety | null>;

  createSobriety: (payload: Partial<Sobriety>) => Promise<boolean>;
  updateSobriety: (id: number, payload: Partial<Sobriety>) => Promise<boolean>;
  deleteSobriety: (id: number) => Promise<boolean>;

  relapse: (id: number, note?: string) => Promise<boolean>;
  restart: (id: number) => Promise<boolean>;
}

export const useSobrietyStore = create<SobrietyStore>((set, get) => ({
  sobrietyList: [],
  loading: false,

  loadSobriety: async (silent = false) => {
    if (!silent) set({ loading: true });

    try {
      const res = await api.get<Sobriety[]>("/sobriety/");
      set({ sobrietyList: res.data });
    } catch (e) {
      console.error("loadSobriety", e);
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  getSobrietyById: async (id) => {
    try {
      const res = await api.get<Sobriety>(`/sobriety/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getSobrietyById", e);
      return null;
    }
  },

  createSobriety: async (payload) => {
    try {
      await api.post("/sobriety/", payload);
      await get().loadSobriety();
      return true;
    } catch (e) {
      console.error("createSobriety", e);
      return false;
    }
  },

  updateSobriety: async (id, payload) => {
    try {
      await api.patch(`/sobriety/${id}/`, payload);
      await get().loadSobriety();
      return true;
    } catch (e) {
      console.error("updateSobriety", e);
      return false;
    }
  },

  deleteSobriety: async (id) => {
    try {
      await api.delete(`/sobriety/${id}/`);
      set((state) => ({
        sobrietyList: state.sobrietyList.filter(s => s.id !== id),
      }));
      return true;
    } catch (e) {
      console.error("deleteSobriety", e);
      return false;
    }
  },

  relapse: async (id, note) => {
    try {
      await api.post(`/sobriety/${id}/relapse/`, { note });
      await get().loadSobriety();
      return true;
    } catch (e) {
      console.error("relapse", e);
      return false;
    }
  },

  restart: async (id) => {
    try {
      await api.post(`/sobriety/${id}/restart/`);
      await get().loadSobriety();
      return true;
    } catch (e) {
      console.error("restart", e);
      return false;
    }
  },
}));