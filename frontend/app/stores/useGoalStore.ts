import { create } from "zustand";
import { api } from "../api/apiClient";

export interface DifficultyType {
  id: number;
  name: string;
}

export interface GoalPeriod {
  id: number;
  name: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  motivation_reason: string;

  floor_goal?: string;
  target_goal?: string;
  ceiling_goal?: string;

  period: GoalPeriod;
  difficulty: DifficultyType;

  is_completed: boolean;
  completed_at?: string | null;

  is_archived: boolean;
  archived_at?: string | null;

  created_at: string;
  updated_at: string;

  steps: GoalStep[];
}
export interface GoalStep {
  id: number;
  title: string;
  is_completed: boolean;
  order: number;
  created_at: string;
}

interface GoalStore {
  goals: Goal[];
  periods: GoalPeriod[];

  currentPeriod?: string;
  showArchived: boolean;

  loading: {
    list: boolean;
    periods: boolean;
    meta: boolean;
    saving: boolean;
  };

  loadPeriods: () => Promise<void>;
  loadGoals: (period?: string, archived?: boolean) => Promise<void>;
  loadDifficulties: () => Promise<DifficultyType[]>;

  createGoal: (payload: any) => Promise<boolean>;
  saveGoal: (id: number, payload: any) => Promise<boolean>;
  deleteGoal: (id: number) => Promise<boolean>;

  completeGoal: (id: number) => Promise<{
    xp_gained: number;
    total_xp: number;
    current_level: number;
  } | null>;

  toggleArchive: (id: number) => Promise<boolean>;

  addStep: (goalId: number, title: string) => Promise<GoalStep | null>;
  toggleStep: (goalId: number, stepId: number) => Promise<boolean>;
  updateStep: (stepId: number, title: string) => Promise<boolean>;
  deleteStep: (stepId: number) => Promise<boolean>;

  pickRandomGoal: (period?: string) => Promise<Goal | null>;
  getGoalById: (id: number) => Promise<Goal | null>;

  setShowArchived: (value: boolean) => void;
}

const initialState = {
  goals: [],
  periods: [],
  currentPeriod: undefined,
  showArchived: false,
  loading: {
    list: false,
    periods: false,
    meta: false,
    saving: false,
  },
};

export const useGoalStore = create<GoalStore>((set, get) => ({
  ...initialState,

  loadPeriods: async () => {
    set((s) => ({ loading: { ...s.loading, periods: true } }));
    try {
      const res = await api.get<GoalPeriod[]>("/goals/periods/");
      set({ periods: res.data });
    } catch (e) {
      console.error("loadPeriods", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, periods: false } }));
    }
  },

loadGoals: async (period, archived = false) => {
  set((s) => ({ loading: { ...s.loading, list: true } }));

  try {
    let url = "/goals/?";

    if (period) {
      url += `period=${period}&`;
    }

    url += `archived=${archived ? "true" : "false"}`;

    const res = await api.get<Goal[]>(url);

    set({
      goals: res.data,
      currentPeriod: period,
      showArchived: archived,
    });
  } catch (e) {
    console.error("loadGoals", e);
  } finally {
    set((s) => ({ loading: { ...s.loading, list: false } }));
  }
},


  loadDifficulties: async () => {
    set((s) => ({ loading: { ...s.loading, meta: true } }));
    try {
      const res = await api.get<DifficultyType[]>("/common/difficulties/");
      return res.data;
    } catch (e) {
      console.error("loadDifficulties", e);
      return [];
    } finally {
      set((s) => ({ loading: { ...s.loading, meta: false } }));
    }
  },

  createGoal: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/goals/", payload);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("createGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },


  saveGoal: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/goals/${id}/`, payload);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("saveGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },


  deleteGoal: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/goals/${id}/`);
      await get().loadGoals(get().currentPeriod);
      return true;
    } catch (e) {
      console.error("deleteGoal", e);
      return false;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

completeGoal: async (id) => {
    try {
      const res = await api.post(`/goals/${id}/complete/`);
      await get().loadGoals(get().currentPeriod, get().showArchived);
      return res.data;
    } catch (e) {
      console.error("completeGoal", e);
      return null;
    }
  },

  getGoalById: async (id) => {
    try {
      const res = await api.get(`/goals/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getGoalById", e);
      return null;
    }
  },

  pickRandomGoal: async (period?: string) => {
    try {
      const url = period ? `/goals/random/?period=${period}` : "/goals/random/";
      const res = await api.get<Goal | null>(url);
      return res.data;
    } catch (e) {
      console.error("pickRandomGoal", e);
      return null;
    }
  },

  setShowArchived: (value) => set({ showArchived: value }),

  toggleArchive: async (id) => {
  try {
    await api.post(`/goals/${id}/archive/`);
    await get().loadGoals(get().currentPeriod, get().showArchived);
    return true;
  } catch (e) {
    console.error("toggleArchive", e);
    return false;
  }
},

toggleStep: async (goalId, stepId) => {
  try {
    await api.post(`/goals/steps/${stepId}/toggle/`);
    await get().loadGoals(get().currentPeriod, get().showArchived);
    return true;
  } catch (e) {
    console.error("toggleStep", e);
    return false;
  }
},

updateStep: async (stepId, title) => {
  try {
    await api.patch(`/goals/steps/${stepId}/`, { title });
    return true;
  } catch (e) {
    console.error("updateStep", e);
    return false;
  }
},

deleteStep: async (stepId) => {
  try {
    await api.delete(`/goals/steps/${stepId}/`);
    return true;
  } catch (e) {
    console.error("deleteStep", e);
    return false;
  }
},

addStep: async (goalId, title) => {
  try {
    const res = await api.post(`/goals/${goalId}/steps/`, { title });
    return res.data; // 👈 zwracamy step
  } catch (e) {
    console.error("addStep", e);
    return null;
  }
},

}));
