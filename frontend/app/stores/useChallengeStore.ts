import { create } from "zustand";
import { api } from "../api/apiClient";
import type { XpResult } from "./useGamificationStore";

/* ---------- TYPES ---------- */

export interface ChallengeTag {
  id: number;
  name: string;
}

export interface ChallengeType {
  id: number;
  name: "daily" | "weekly";
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

export interface UserChallenge {
  id: number;
  challenge: Challenge;
  start_date: string;
  challenge_type: ChallengeType;
  weekly_deadline?: string;
  progress_days?: number;
  is_completed: boolean;
}

/* ---------- STORE ---------- */

interface ChallengeStore {
  challenges: Challenge[];
  tags: ChallengeTag[];

  activeDaily: UserChallenge | null;
  activeWeekly: UserChallenge[];

  loading: boolean;

  selectedType: "daily" | "weekly";
  setSelectedType: (t: "daily" | "weekly") => void;

  loadChallenges: () => Promise<void>;
  loadTags: () => Promise<void>;
  fetchActive: () => Promise<void>;

  refreshAll: () => Promise<void>;

  randomChallenge: (
    type: "daily" | "weekly",
    tagIds?: number[]
  ) => Promise<Challenge | null>;

  assignChallenge: (challengeId: number) => Promise<UserChallenge | null>;
  discardUserChallenge: (id: number) => Promise<boolean>;
  completeUserChallenge: (id: number) => Promise<XpResult | null>;

  resetChallenges: () => void;
}

/* ---------- IMPLEMENTATION ---------- */

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  tags: [],
  activeDaily: null,
  activeWeekly: [],
  loading: false,
  selectedType: "daily",

  /* ---------- UI ---------- */

  setSelectedType: (t) => set({ selectedType: t }),

  /* ---------- LOADERS ---------- */

  loadChallenges: async () => {
    set({ loading: true });
    try {
      const res = await api.get<Challenge[]>("/challenges/");
      set({ challenges: res.data });
    } catch (e: any) {
      console.error("loadChallenges", e.response?.data || e.message || e);
    } finally {
      set({ loading: false });
    }
  },

  loadTags: async () => {
    try {
      const res = await api.get<ChallengeTag[]>("/challenges/tags/");
      set({ tags: res.data });
    } catch (e: any) {
      console.error("loadTags", e.response?.data || e.message || e);
    }
  },

  fetchActive: async () => {
    try {
      const res = await api.get("/challenges/active/");
      set({
        activeDaily: res.data.daily || null,
        activeWeekly: res.data.weekly || [],
      });
    } catch (e: any) {
      console.error("fetchActive", e.response?.data || e.message || e);
      set({ activeDaily: null, activeWeekly: [] });
    }
  },

  /* ---------- 🔑 SYNCHRONIZATION ---------- */

  refreshAll: async () => {
    await Promise.all([
      get().loadChallenges(),
      get().fetchActive(),
    ]);
  },

  /* ---------- ACTIONS ---------- */

  randomChallenge: async (type, tagIds = []) => {
    try {
      const params: any = { type };
      if (tagIds.length) params.tags = tagIds.join(",");

      const res = await api.get<Challenge>("/challenges/random/", { params });
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 404) return null;
      console.warn("randomChallenge", e.response?.data || e.message || e);
      return null;
    }
  },

  assignChallenge: async (challengeId) => {
    try {
      const res = await api.post<UserChallenge>("/challenges/assign/", {
        challenge: challengeId,
      });

      await get().refreshAll();
      return res.data;
    } catch (e) {
      console.error("assignChallenge", e);
      return null;
    }
  },

  discardUserChallenge: async (id) => {
    try {
      await api.post(`/challenges/user-challenges/${id}/discard/`);
      await get().refreshAll();
      return true;
    } catch (e: any) {
      console.error("discardUserChallenge", e.response?.data || e.message || e);
      return false;
    }
  },

  completeUserChallenge: async (id) => {
    try {
      const res = await api.post<XpResult>(
        `/challenges/user-challenges/${id}/complete/`
      );

      await get().refreshAll();
      return res.data;
    } catch (e: any) {
      console.error("completeUserChallenge", e.response?.data || e.message || e);
      return null;
    }
  },

  /* ---------- RESET ---------- */

  resetChallenges: () =>
    set({
      challenges: [],
      tags: [],
      activeDaily: null,
      activeWeekly: [],
    }),
}));
