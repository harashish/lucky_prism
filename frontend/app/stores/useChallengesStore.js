import { create } from "zustand";
import api from "../api/apiClient";
import { useAuthStore } from "./useAuthStore";

export const useChallengesStore = create((set) => ({
  templates: [],
  userChallenges: [],
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true });
    try {
      const res = await api.get("challenges/templates/");
      set({ templates: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUserChallenges: async (token) => {
    set({ loading: true });
    try {
      const res = await api.get("challenges/user-challenges/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ userChallenges: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  drawChallenge: async (token, scope = null) => {
    const data = scope ? { scope } : {};
    const res = await api.post(
      "challenges/user-challenges/draw/",
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    set((state) => ({
      userChallenges: [res.data, ...state.userChallenges],
    }));

    return res.data;
  },
}));
