import { create } from "zustand";
import { api } from "../api/apiClient";

/* ---------- TYPES ---------- */

export interface DifficultyType {
  id: number;
  name: string;
}

export interface TodoCategory {
  id: number;
  name: string;
  color?: string;
  difficulty?: DifficultyType;
}

export interface TodoTask {
  id: number;
  content: string;
  is_default: boolean;
  custom_difficulty?: DifficultyType | null;
  category: TodoCategory;
  is_completed: boolean;
  created_at: string;
}

/* ---------- STORE ---------- */

interface TodoStore {
  categories: TodoCategory[];
  tasks: TodoTask[];

  selectedCategoryId: number | null;
  hasUncompletedTasksInSelectedCategory: boolean | null;

  loading: {
    categories: boolean;
    tasks: boolean;
    saving: boolean;
    meta: boolean;
  };

  /* --- load --- */
  loadCategories: () => Promise<void>;
  loadTasks: (categoryId: number) => Promise<void>;
  loadDifficulties: () => Promise<DifficultyType[]>;

  /* --- categories --- */
  createCategory: (payload: any) => Promise<void>;
  saveCategory: (id: number, payload: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  /* --- tasks --- */
  quickAddTask: (
    categoryId: number,
    content: string,
    customDifficultyId?: number | null
  ) => Promise<void>;

  updateTask: (
    taskId: number,
    payload: { content: string; custom_difficulty_id?: number | null }
  ) => Promise<void>;

  completeTask: (
    taskId: number
  ) => Promise<{ xp_gained: number; total_xp: number; current_level: number } | null>;

  deleteTask: (taskId: number) => Promise<void>;

  /* --- random --- */
  fetchRandomTask: (categoryId?: number) => Promise<TodoTask | null>;

  /* --- helpers --- */
  checkCategoryHasUncompletedTasks: (categoryId: number) => Promise<void>;
  getCategoryById: (id: number) => Promise<TodoCategory | null>;

  /* --- ui --- */
  setSelectedCategoryId: (id: number | null) => void;

}

/* ---------- INITIAL STATE ---------- */

const initialState = {
  categories: [],
  tasks: [],
  selectedCategoryId: null,
  hasUncompletedTasksInSelectedCategory: null,
  loading: {
    categories: false,
    tasks: false,
    saving: false,
    meta: false,
  },
};

/* ---------- IMPLEMENTATION ---------- */

export const useTodoStore = create<TodoStore>((set, get) => ({
  ...initialState,

  /* ---------- LOAD ---------- */

  loadCategories: async () => {
    set((s) => ({ loading: { ...s.loading, categories: true } }));
    try {
      const res = await api.get<TodoCategory[]>("/todos/categories/");
      set({ categories: res.data });
    } catch (e) {
      console.error("loadCategories", e);
    } finally {
      set((s) => ({ loading: { ...s.loading, categories: false } }));
    }
  },

  loadTasks: async (categoryId) => {
    if (!categoryId) return;

    set((s) => ({ loading: { ...s.loading, tasks: true } }));
    try {
      const res = await api.get<TodoTask[]>("/todos/tasks/", {
        params: { category_id: categoryId },
      });

      const hasUncompleted = res.data.some(t => !t.is_completed);

      set({
        tasks: res.data,
        hasUncompletedTasksInSelectedCategory: hasUncompleted,
      });
    } catch (e) {
      console.error("loadTasks", e);
      set({ hasUncompletedTasksInSelectedCategory: false });
    } finally {
      set((s) => ({ loading: { ...s.loading, tasks: false } }));
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

  /* ---------- CATEGORY CRUD ---------- */

  createCategory: async (payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/todos/categories/", payload);
      await get().loadCategories();
    } catch (e) {
      console.error("createCategory", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  saveCategory: async (id, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/todos/categories/${id}/`, payload);
      await get().loadCategories();
    } catch (e) {
      console.error("saveCategory", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  deleteCategory: async (id) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.delete(`/todos/categories/${id}/`);
      await get().loadCategories();
    } catch (e) {
      console.error("deleteCategory", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  /* ---------- TASKS ---------- */

  quickAddTask: async (categoryId, content, customDifficultyId = null) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.post("/todos/tasks/", {
        category_id: categoryId,
        content,
        custom_difficulty_id: customDifficultyId,
      });
      await get().loadTasks(categoryId);
    } catch (e) {
      console.error("quickAddTask", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  updateTask: async (taskId, payload) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      await api.patch(`/todos/tasks/${taskId}/`, payload);
      const task = get().tasks.find((t) => t.id === taskId);
      if (task) await get().loadTasks(task.category.id);
    } catch (e) {
      console.error("updateTask", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  completeTask: async (taskId) => {
    try {
      const res = await api.post(`/todos/tasks/${taskId}/complete/`);
      const task = get().tasks.find((t) => t.id === taskId);
      if (task) await get().loadTasks(task.category.id);
      return res.data;
    } catch (e) {
      console.error("completeTask", e);
      return null;
    }
  },

  deleteTask: async (taskId) => {
    set((s) => ({ loading: { ...s.loading, saving: true } }));
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      await api.delete(`/todos/tasks/${taskId}/`);
      if (task) await get().loadTasks(task.category.id);
    } catch (e) {
      console.error("deleteTask", e);
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, saving: false } }));
    }
  },

  /* ---------- RANDOM ---------- */

  fetchRandomTask: async (categoryId) => {
    try {
      const res = await api.get<TodoTask>("/todos/tasks/random/", {
        params: categoryId ? { category_id: categoryId } : {},
      });
      return res.data ?? null;
    } catch (e) {
      console.error("fetchRandomTask", e);
      return null;
    }
  },

  /* ---------- HELPERS ---------- */

  checkCategoryHasUncompletedTasks: async (categoryId) => {
    try {
      const res = await api.get<TodoTask[]>("/todos/tasks/", {
        params: { category_id: categoryId },
      });
      const hasUncompleted = res.data.some(t => !t.is_completed);
      set({ hasUncompletedTasksInSelectedCategory: hasUncompleted });
    } catch (e) {
      console.error("checkCategoryHasUncompletedTasks", e);
      set({ hasUncompletedTasksInSelectedCategory: false });
    }
  },

  getCategoryById: async (id) => {
    try {
      const res = await api.get<TodoCategory>(`/todos/categories/${id}/`);
      return res.data;
    } catch (e) {
      console.error("getCategoryById", e);
      return null;
    }
  },

  /* ---------- UI ---------- */

  setSelectedCategoryId: (id) =>
    set({
      selectedCategoryId: id,
      tasks: [],
      hasUncompletedTasksInSelectedCategory: null,
    }),

}));
