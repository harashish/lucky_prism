// frontend/app/stores/useChallengeStore.ts
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

export interface UserChallenge {
  id: number;
  challenge: Challenge;
  start_date: string;
}

export interface ChallengeWithUserInfo extends Challenge {
  userChallengeId?: number; // opcjonalne, jeśli challenge jest już przypisany
}


interface ChallengeStore {
  challenges: Challenge[];
  tags: ChallengeTag[];
  userChallenges: UserChallenge[];
  loadingChallenges: boolean;
  loadingTags: boolean;
  loadingUserChallenges: boolean;
  loadChallenges: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadUserChallenges: (userId: number) => Promise<void>;
  addUserChallenge: (userId: number, challengeId: number) => Promise<void>;
  resetChallenges: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  tags: [],
  userChallenges: [],
  loadingChallenges: false,
  loadingTags: false,
  loadingUserChallenges: false,

  loadChallenges: async () => {
    set({ loadingChallenges: true, challenges: [] });
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
      const res = await api.get<ChallengeTag[]>("/challenges/tags/");
      set({ tags: res.data });
    } catch (e: any) {
      console.error("Error loading tags:", e.response?.data || e.message || e);
    } finally {
      set({ loadingTags: false });
    }
  },

  loadUserChallenges: async (userId: number) => {
    set({ loadingUserChallenges: true });
    try {
      const res = await api.get<UserChallenge[]>(`/challenges/user-challenges/${userId}/`);
      set({ userChallenges: res.data });
    } catch (e: any) {
      console.error("Error loading user challenges:", e.response?.data || e.message || e);
    } finally {
      set({ loadingUserChallenges: false });
    }
  },

  /*addUserChallenge: async (userId: number, challengeId: number) => {
    try {
      await api.post(`/challenges/user-challenges/`, { user: userId, challenge: challengeId });
      // odśwież listę przypisanych challenge po dodaniu
      await get().loadUserChallenges(userId);
    } catch (e: any) {
      console.error("Error adding user challenge:", e.response?.data || e.message || e);
    }
  },*/

addUserChallenge: async (userId: number, challengeId: number) => {
    try {
      // Zmiana z '/challenges/user-challenges/' na '/challenges/assign/'
      await api.post(`/challenges/assign/`, { user: userId, challenge: challengeId });
      // odśwież listę przypisanych challenge po dodaniu
      await get().loadUserChallenges(userId);
    } catch (e: any) {
      console.error("Error adding user challenge:", e.response?.data || e.message || e);
    }
  },

  resetChallenges: () => set({ challenges: [], userChallenges: [] }),
}));

