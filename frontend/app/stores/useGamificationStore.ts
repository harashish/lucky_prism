import { create } from "zustand";
import { api } from "../api/apiClient";

export type XpResult = {
  xp_gained: number;
  total_xp: number;
  current_level: number;
};

type XpPopup = {
  xp: number;
  levelUp: boolean;
};

type GamificationState = {
  totalXp: number;
  currentLevel: number;
  xpPopup: XpPopup | null;
  loading: boolean;

  fetchUser: () => Promise<void>;
  applyXpResult: (result: XpResult) => void;
  clearXpPopup: () => void;
  resetGamification: () => void;
};


export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: 0,
  currentLevel: 1,
  xpPopup: null,
  loading: false,


  fetchUser: async () => {
    set({ loading: true });
    const res = await api.get("/gamification/me/");
    set({
      totalXp: res.data.total_xp,
      currentLevel: res.data.current_level,
      loading: false,
    });
  },


  applyXpResult: (result) => {
    const prevLevel = get().currentLevel;
    const levelUp = result.current_level > prevLevel;

    set({
      totalXp: result.total_xp,
      currentLevel: result.current_level,
      xpPopup: {
        xp: result.xp_gained,
        levelUp,
      },
    });
  },

  clearXpPopup: () => {
    set({ xpPopup: null });
  },

  resetGamification: () => {
    set({
      totalXp: 0,
      currentLevel: 1,
      xpPopup: null,
    });
  },
}));
