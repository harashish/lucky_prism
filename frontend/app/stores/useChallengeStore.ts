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
  difficulties: DifficultyType[];

  activeDaily: UserChallenge | null;
  activeWeekly: UserChallenge[];

  loading: {
    list: boolean;      // challenges / active
    meta: boolean;      // tags / difficulties / types
    saving: boolean;    // create / update / delete / assign
  };

  selectedType: "daily" | "weekly";
  setSelectedType: (t: "daily" | "weekly") => void;

  /* --- load --- */
  loadChallenges: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadDifficulties: () => Promise<DifficultyType[]>;
  loadTypes: () => Promise<ChallengeType[]>;
  fetchActive: () => Promise<void>;

  /* --- gameplay --- */
  fetchRandomChallenge: (
    type: "daily" | "weekly",
    tagIds?: number[],
    difficultyId?: number | null
  ) => Promise<Challenge | null>;

  assignChallenge: (challengeId: number) => Promise<UserChallenge | null>;
  discardUserChallenge: (id: number) => Promise<void>;
  completeUserChallenge: (id: number) => Promise<XpResult | null>;

  /* --- crud (admin) --- */
  getChallengeById: (id: number) => Promise<Challenge | null>;
  createChallenge: (payload: any) => Promise<void>;
  updateChallenge: (id: number, payload: any) => Promise<void>;
  deleteChallenge: (id: number) => Promise<void>;

  /* --- tags --- */
  getTagById: (id: number) => Promise<ChallengeTag | null>;
  createTag: (payload: { name: string }) => Promise<void>;
  updateTag: (id: number, payload: { name: string }) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
}

/* ---------- IMPLEMENTATION ---------- */

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  tags: [],
  difficulties: [],
  activeDaily: null,
  activeWeekly: [],
  selectedType: "daily",

  loading: {
    list: false,
    meta: false,
    saving: false,
  },

  /* ---------- UI ---------- */

  setSelectedType: (t) => set({ selectedType: t }),

  /* ---------- LOAD ---------- */

  loadChallenges: async () => {
    set((s) => ({ loading: { ...s.loading, list: true } }));
    try {
      const res = await api.get<Challenge[]>("/challenges/");
      set({ challenges: res.data });
    } catch (e) {
      console.error("loadChallenges", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, list: false } }));
    }
  },

  loadTags: async () => {
    set((s) => ({ loading: { ...s.loading, meta: true } }));
    try {
      const res = await api.get<ChallengeTag[]>("/challenges/tags/");
      set({ tags: res.data });
    } catch (e) {
      console.error("loadTags", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, meta: false } }));
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

  loadTypes: async () => {
    try {
      const res = await api.get<ChallengeType[]>("/challenges/types/");
      return res.data;
    } catch (e) {
      console.error("loadTypes", e);
      return [];
    }
  },

  fetchActive: async () => {
    set((s) => ({ loading: { ...s.loading, list: true } }));
    try {
      const res = await api.get("/challenges/active/");
      set({
        activeDaily: res.data.daily || null,
        activeWeekly: res.data.weekly || [],
      });
    } catch (e) {
      console.error("fetchActive", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, list: false } }));
    }
  },

  /* ---------- GAMEPLAY ---------- */

  fetchRandomChallenge: async (type, tagIds = [], difficultyId = null) => {
    try {
      const params: any = { type };
      if (tagIds.length) params.tags = tagIds.join(",");
      if (difficultyId) params.difficulty_id = difficultyId;

      const res = await api.get<Challenge>("/challenges/random/", { params });
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 404) return null;
      console.warn("fetchRandomChallenge", e);
      return null;
    }
  },

  assignChallenge: async (challengeId) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      const res = await api.post<UserChallenge>("/challenges/assign/", {
        challenge: challengeId,
      });
      await Promise.all([get().loadChallenges(), get().fetchActive()]);
      return res.data;
    } catch (e) {
      console.error("assignChallenge", e);
      return null;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  discardUserChallenge: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post(`/challenges/user-challenges/${id}/discard/`);
      await Promise.all([get().loadChallenges(), get().fetchActive()]);
    } catch (e) {
      console.error("discardUserChallenge", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  completeUserChallenge: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      const res = await api.post<XpResult>(
        `/challenges/user-challenges/${id}/complete/`
      );
      await Promise.all([get().loadChallenges(), get().fetchActive()]);
      return res.data;
    } catch (e) {
      console.error("completeUserChallenge", e);
      return null;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  /* ---------- CRUD (ADMIN) ---------- */

  getChallengeById: async (id) => {
    try {
      const res = await api.get(`/challenges/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getChallengeById", e);
      return null;
    }
  },

  createChallenge: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/challenges/", payload);
      await get().loadChallenges();
    } catch (e) {
      console.error("createChallenge", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  updateChallenge: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/challenges/${id}/`, payload);
      await get().loadChallenges();
    } catch (e) {
      console.error("updateChallenge", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  deleteChallenge: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/challenges/${id}/`);
      await get().loadChallenges();
    } catch (e) {
      console.error("deleteChallenge", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  /* ---------- TAGS ---------- */

  getTagById: async (id) => {
    try {
      const res = await api.get<ChallengeTag>(`/challenges/tags/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getTagById", e);
      return null;
    }
  },

  createTag: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/challenges/tags/", payload);
      await get().loadTags();
    } catch (e) {
      console.error("createTag", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  updateTag: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/challenges/tags/${id}/`, payload);
      await get().loadTags();
    } catch (e) {
      console.error("updateTag", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  deleteTag: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/challenges/tags/${id}/`);
      await get().loadTags();
    } catch (e) {
      console.error("deleteTag", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

}));
