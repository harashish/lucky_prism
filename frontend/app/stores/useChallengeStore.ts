import { create } from "zustand";
import { api } from "../api/apiClient";

interface Challenge {
  id: number;
  title: string;
  description: string;
}

interface ChallengeState {
  challenges: Challenge[];
  loading: boolean;

  loadChallenges: () => Promise<void>;
}

export const useChallengeStore = create<ChallengeState>((set) => ({
  challenges: [],
  loading: false,

  loadChallenges: async () => {
    set({ loading: true });

    try {
      const res = await api.get("/challenges/");
      set({ challenges: res.data });
    } catch (e) {
      console.log("Error loading challenges:", e);
    }

    set({ loading: false });
  },
}));
