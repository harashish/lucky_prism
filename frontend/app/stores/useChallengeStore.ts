import { create } from "zustand";
import { api } from "../api/apiClient";

export interface ChallengeTag { id: number; name: string; }
export interface ChallengeType { id: number; name: string; }
export interface DifficultyType { id: number; name: string }
export interface Challenge { id:number; title:string; description:string; type:ChallengeType; difficulty:DifficultyType; tags:ChallengeTag[]; is_default:boolean; }
export interface UserChallenge { id:number; challenge: Challenge; start_date: string; challenge_type: string; weekly_deadline?: string; progress_percent?: number; is_completed: boolean; }

interface ChallengeStore {
  challenges: Challenge[];
  tags: ChallengeTag[];
  userChallenges: UserChallenge[];
  activeDaily: UserChallenge | null;
  activeWeekly: UserChallenge[]; // up to 3
  loading: boolean;

  loadChallenges: () => Promise<void>;
  loadTags: () => Promise<void>;
  loadUserChallenges: (userId: number) => Promise<void>;
  fetchActive: (userId: number) => Promise<void>;

  randomChallenge: (userId: number, type: "Daily" | "Weekly", tagIds?: number[]) => Promise<Challenge | null>;
  assignChallenge: (userId: number, challengeId: number) => Promise<UserChallenge | null>;
  discardUserChallenge: (id: number) => Promise<boolean>;
  completeUserChallenge: (id: number) => Promise<{
  xp_gained: number;
  total_xp: number;
  current_level: number;
} | null>;


  reset: () => void;
}

export interface ChallengeWithUserInfo extends Challenge {
  userChallengeId?: number;
  // dodajemy pola UserChallenge, które potrzebujemy w UI
  challenge_type?: string;
  progress_percent?: number;
}



export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  tags: [],
  userChallenges: [],
  activeDaily: null,
  activeWeekly: [],
  loading: false,

  loadChallenges: async () => {
    set({ loading: true });
    try {
      const res = await api.get<Challenge[]>("/challenges/");
      set({ challenges: res.data });
    } catch (e: any) {
      console.error("loadChallenges", e.response?.data || e.message || e);
    } finally { set({ loading: false }); }
  },

  loadTags: async () => {
    set({ loading: true });
    try {
      const res = await api.get<ChallengeTag[]>("/challenges/tags/");
      set({ tags: res.data });
    } catch (e: any) {
      console.error("loadTags", e.response?.data || e.message || e);
    } finally { set({ loading: false }); }
  },

  loadUserChallenges: async (userId: number) => {
    set({ loading: true });
    try {
      const res = await api.get<UserChallenge[]>(`/challenges/user-challenges/${userId}/`);
      set({ userChallenges: res.data });
    } catch (e: any) {
      console.error("loadUserChallenges", e.response?.data || e.message || e);
    } finally { set({ loading: false }); }
  },

  fetchActive: async (userId: number) => {
    set({ loading: true });
    try {
      const res = await api.get(`/challenges/active/${userId}/`);
      set({ activeDaily: res.data.daily || null, activeWeekly: res.data.weekly || [] });
    } catch (e: any) {
      console.error("fetchActive", e.response?.data || e.message || e);
      set({ activeDaily: null, activeWeekly: [] });
    } finally { set({ loading: false }); }
  },

  randomChallenge: async (userId, type, tagIds = []) => {
    try {
      const params: any = { user_id: userId, type };
      if (tagIds.length) params.tags = tagIds.join(",");
      const res = await api.get<Challenge>("/challenges/random/", { params });
      return res.data;
    } catch (e: any) {
      console.warn("randomChallenge", e.response?.data || e.message || e);
      return null;
    }
  },

assignChallenge: async (userId, challengeId) => {
  try {
    const payload = { user: userId, challenge: challengeId };
    const res = await api.post<UserChallenge>("/challenges/assign/", payload);
    await get().fetchActive(userId);
    return res.data;
  } catch (e: any) {
    // jeśli błąd typu "Active daily challenge already exists"
    if (e.response?.data?.detail?.includes("already exists")) {
      await get().fetchActive(userId); // odśwież aktywne
      const { activeDaily, activeWeekly } = get();
      const definition = await api.get(`/challenges/${challengeId}/`); // pobierz szczegóły challenge
      // zwracamy istniejący challenge dla frontend, żeby ekran aktywny mógł działać
      if (definition.data.type.name === "Daily") return activeDaily;
      if (definition.data.type.name === "Weekly") return activeWeekly[0]; // jeśli wiele, zwracamy pierwsze
      return null;
    }

    console.error("assignChallenge", e.response?.data || e.message || e);
    return null;
  }
},


  discardUserChallenge: async (id) => {
    try {
      await api.post(`/challenges/user-challenges/${id}/discard/`);
      return true;
    } catch (e: any) {
      console.error("discardUserChallenge", e.response?.data || e.message || e);
      return false;
    }
  },

  completeUserChallenge: async (id) => {
    try {
      const res = await api.post(`/challenges/user-challenges/${id}/complete/`);
      return res.data;
    } catch (e: any) {
      console.error("completeUserChallenge", e.response?.data || e.message || e);
      return null;
    }
  },

  reset: () => set({ challenges: [], tags: [], userChallenges: [], activeDaily: null, activeWeekly: [] }),
}));
