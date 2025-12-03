import { create } from "zustand";
import { api } from "../api/apiClient";

export interface ChallengeTag {
  id: number;
  name: string;
}

export interface ChallengeType {
  id: number;
  name: string;
}

export interface DifficultyType {
  id: number;
  name: string;
  xp_value: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: DifficultyType;
  tags: ChallengeTag[];
  is_default: boolean;
}

interface ChallengeStore {
  challenges: Challenge[];
  tags: ChallengeTag[];
  loadingChallenges: boolean;
  loadingTags: boolean;
  loadChallenges: () => Promise<void>;
  loadTags: () => Promise<void>;
  resetChallenges: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  challenges: [],
  tags: [],
  loadingChallenges: false,
  loadingTags: false,

  loadChallenges: async () => {
    set({ loadingChallenges: true, challenges: [] }); // reset stare dane
    try {
      const res = await api.get<Challenge[]>("/challenges/");
      set({ challenges: res.data });
    } catch (e: any) {
      console.error("Error loading challenges:", e.response?.data || e.message || e);
    } finally {
      set({ loadingChallenges: false });
    }
  },

  loadTags: async () => {
    set({ loadingTags: true });
    try {
      const res = await api.get<ChallengeTag[]>("/tags/");
      set({ tags: res.data });
    } catch (e: any) {
      console.error("Error loading tags:", e.response?.data || e.message || e);
    } finally {
      set({ loadingTags: false });
    }
  },

  resetChallenges: () => set({ challenges: [] }),
}));
