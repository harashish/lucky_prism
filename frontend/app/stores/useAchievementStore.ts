import { create } from "zustand";
import { api } from "../api/apiClient";

/*
========================
TYPES
========================
*/

export interface Achievement {
  id: number;
  name: string;
  description?: string;

  difficulty?: {
    id: number;
    name: string;
    order?: number;
  };

  condition_type: string;
  condition_config: Record<string, any>;

  is_hidden: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;

  current_value: number;
  target_value: number;
  progress_percent: number;

  is_completed: boolean;
  completed_at?: string | null;

  updated_at: string;
}

export type AchievementPopup = {
  name: string;
  id: number;
};

/*
========================
STORE
========================
*/

interface AchievementStore {
  userAchievements: UserAchievement[];
  allAchievements: Achievement[];

  achievementPopup: AchievementPopup | null;
  showAchievementPopup: (a: AchievementPopup) => void;
  clearAchievementPopup: () => void;

  loading: boolean;

  loadUserAchievements: (silent?: boolean) => Promise<void>;
  loadAllAchievements: () => Promise<void>;

  createAchievement: (payload: Partial<Achievement>) => Promise<boolean>;
  updateAchievement: (id: number, payload: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: number) => Promise<boolean>;

  unlockManualAchievement: (id: number) => Promise<boolean>;

  refreshAll: () => Promise<void>;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  userAchievements: [],
  allAchievements: [],
  achievementPopup: null,

  showAchievementPopup: (a) => {
    set({ achievementPopup: a });
  },

  clearAchievementPopup: () => {
    set({ achievementPopup: null });
  },

  loading: false,

  /*
  ========================
  LOAD USER ACHIEVEMENTS
  ========================
  */

  loadUserAchievements: async (silent = false) => {
    if (!silent) set({ loading: true });

    try {
      const prev = get().userAchievements;
      const res = await api.get<UserAchievement[]>("/achievements/user/");
      const next = res.data;

      // detect new unlocks
      const newlyUnlocked =
        prev.length === 0
          ? []
          : next.filter(n => {
              const old = prev.find(p => p.id === n.id);
              return n.is_completed && !old?.is_completed;
            });

      set({ userAchievements: next });

      if (newlyUnlocked.length > 0) {
        get().showAchievementPopup({
          id: newlyUnlocked[0].achievement.id,
          name: newlyUnlocked[0].achievement.name,
        });
      }

    } catch (e) {
      console.error("loadUserAchievements", e);
    } finally {
      if (!silent) set({ loading: false });
    }
  },

  /*
  ========================
  LOAD ALL ACHIEVEMENTS (templates)
  ========================
  */

  loadAllAchievements: async () => {
    set({ loading: true });

    try {
      const res = await api.get<Achievement[]>("/achievements/");
      set({ allAchievements: res.data });
    } catch (e) {
      console.error("loadAllAchievements", e);
    } finally {
      set({ loading: false });
    }
  },

  /*
  ========================
  CREATE CUSTOM ACHIEVEMENT
  ========================
  */

  createAchievement: async (payload) => {
    try {
      await api.post("/achievements/", payload);
      await get().refreshAll();
      return true;
    } catch (e) {
      console.error("createAchievement", e);
      return false;
    }
  },

  /*
  ========================
  UPDATE CUSTOM ACHIEVEMENT
  ========================
  */

  updateAchievement: async (id, payload) => {
    try {
      await api.patch(`/achievements/${id}/`, payload);
      await get().refreshAll();
      return true;
    } catch (e) {
      console.error("updateAchievement", e);
      return false;
    }
  },

  /*
  ========================
  DELETE CUSTOM ACHIEVEMENT
  ========================
  */

  deleteAchievement: async (id) => {
    try {
      await api.delete(`/achievements/${id}/`);

      set((state) => ({
        allAchievements: state.allAchievements.filter(a => a.id !== id),
        userAchievements: state.userAchievements.filter(
          ua => ua.achievement.id !== id
        ),
      }));

      return true;
    } catch (e) {
      console.error("deleteAchievement", e);
      return false;
    }
  },

  /*
  ========================
  MANUAL UNLOCK
  ========================
  */

  unlockManualAchievement: async (id) => {
    try {
      const a = get().allAchievements.find(x => x.id === id);

      await api.post(`/achievements/${id}/unlock/`);
      await get().loadUserAchievements(true);

      if (a) {
        get().showAchievementPopup({
          id: a.id,
          name: a.name,
        });
      }

      return true;
    } catch (e) {
      console.error("unlockManualAchievement", e);
      return false;
    }
  },

  /*
  ========================
  REFRESH
  ========================
  */

  refreshAll: async () => {
    await Promise.all([
      get().loadAllAchievements(),
      get().loadUserAchievements(true),
    ]);
  },
}));