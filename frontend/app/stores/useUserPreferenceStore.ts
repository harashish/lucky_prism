import { create } from "zustand";
import { api } from "../api/apiClient";

type Store = {
  hideQuickAddDifficulty: boolean;
  hideTodoCompletedToggle: boolean;
  defaultTodoCategoryId: number | null;

  prefMap: Record<string, number>;

  fetchPreferences: () => Promise<void>;
  setHideQuickAddDifficulty: (value: boolean) => Promise<void>;
  setHideTodoCompletedToggle: (value: boolean) => Promise<void>;
  setDefaultTodoCategoryId: (id: number | null) => Promise<void>;
};

export const useUserPreferencesStore = create<Store>((set, get) => ({
  hideTodoCompletedToggle: false,
  defaultTodoCategoryId: null,
  hideQuickAddDifficulty: false,
  prefId: null,
  prefMap: {},

fetchPreferences: async () => {
  const res = await api.get("/settings/preferences/");

  const map: any = {};

  res.data.forEach((p: any) => {
    map[p.key] = p.id;

    if (p.key === "hide_quick_add_difficulty")
      set({ hideQuickAddDifficulty: p.value === "true" });

    if (p.key === "hide_todo_completed_toggle")
      set({ hideTodoCompletedToggle: p.value === "true" });

    if (p.key === "default_todo_category_id")
      set({ defaultTodoCategoryId: p.value ? Number(p.value) : null });
  });

  set({ prefMap: map });
},

  setHideQuickAddDifficulty: async (value) => {
    const id = get().prefMap["hide_quick_add_difficulty"];
    if (!id) return;

    set({ hideQuickAddDifficulty: value });

    await api.patch(`/settings/preferences/${id}/`, {
      value: value ? "true" : "false",
    });
  },

  setHideTodoCompletedToggle: async (value) => {
  const id = get().prefMap["hide_todo_completed_toggle"];
  if (!id) return;

  set({ hideTodoCompletedToggle: value });

  await api.patch(`/settings/preferences/${id}/`, {
    value: value ? "true" : "false",
  });
},
setDefaultTodoCategoryId: async (idValue) => {
  const id = get().prefMap["default_todo_category_id"];
  if (!id) return;

  set({ defaultTodoCategoryId: idValue });

  await api.patch(`/settings/preferences/${id}/`, {
    value: idValue ? String(idValue) : "",
  });
},

}));