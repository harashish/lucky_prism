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
  xpMultiplier: number
  xpPopup: XpPopup | null;
  loading: boolean;

  fetchUser: () => Promise<void>;
  applyXpResult: (result: XpResult) => void;
  setXpMultiplier: (value: number) => Promise<void>;
  clearXpPopup: () => void;
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: 0,
  currentLevel: 1,
  xpMultiplier: 1.0,
  xpPopup: null,
  loading: false,

  fetchUser: async () => {
    set({ loading: true });
    const res = await api.get("/gamification/me/");
    set({
      totalXp: res.data.total_xp,
      currentLevel: res.data.current_level,
      xpMultiplier: res.data.xp_multiplier,
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

  setXpMultiplier: async (value: number) => {
  await api.patch("/gamification/me/", { xp_multiplier: value });
  set({ xpMultiplier: value });
  },

  clearXpPopup: () => {
    set({ xpPopup: null });
  },

}));
