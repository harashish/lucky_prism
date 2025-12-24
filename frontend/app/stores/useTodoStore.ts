import { create } from "zustand";
import { api } from "../api/apiClient";

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

interface TodoStore {
  categories: TodoCategory[];
  tasks: TodoTask[];
  loading: boolean;

  selectedCategoryId: number | null;

  loadCategories: () => Promise<void>;
  loadTasks: (categoryId: number) => Promise<void>;

  addCategory: (payload: any) => Promise<TodoCategory | null>;
  saveCategory: (id: number, payload: any) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;

  quickAddTask: (
    categoryId: number,
    content: string,
    customDifficultyId?: number | null
  ) => Promise<TodoTask | null>;

  completeTask: (
    taskId: number
  ) => Promise<{ xp_gained: number; total_xp: number; current_level: number } | null>;

  deleteTask: (taskId: number) => Promise<boolean>;

  pickRandomTask: (categoryId?: number) => Promise<TodoTask | null>;

  hasTasksInSelectedCategory: boolean | null;
  checkCategoryHasTasks: (categoryId: number) => Promise<void>;

  setSelectedCategoryId: (id: number | null) => void;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  categories: [],
  tasks: [],
  loading: false,
  selectedCategoryId: null,
  hasTasksInSelectedCategory: null,

  // -------- categories --------

  loadCategories: async () => {
    set({ loading: true });
    try {
      const res = await api.get<TodoCategory[]>("/todos/categories/");
      set({ categories: res.data });
    } catch (e: any) {
      console.error("loadCategories", e);
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (payload) => {
    try {
      const res = await api.post("/todos/categories/", payload);
      await get().loadCategories();
      return res.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  saveCategory: async (id, payload) => {
    try {
      await api.patch(`/todos/categories/${id}/`, payload);
      await get().loadCategories();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  deleteCategory: async (id) => {
    await api.delete(`/todos/categories/${id}/`);
    await get().loadCategories();
    return true;
  },

  // -------- tasks --------

  loadTasks: async (categoryId: number) => {
    if (!categoryId) return;

    set({ loading: true });
    try {
      const res = await api.get<TodoTask[]>("/todos/tasks/", {
        params: { category_id: categoryId },
      });
      set({
        tasks: res.data,
        hasTasksInSelectedCategory: res.data.length > 0,
      });
    } catch (e) {
      console.error(e);
      set({ hasTasksInSelectedCategory: false });
    } finally {
      set({ loading: false });
    }
  },

  quickAddTask: async (categoryId, content, customDifficultyId = null) => {
    try {
      const res = await api.post("/todos/tasks/", {
        category_id: categoryId,
        content,
        custom_difficulty_id: customDifficultyId,
      });
      await get().loadTasks(categoryId);
      return res.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  completeTask: async (taskId) => {
    try {
      const res = await api.post(`/todos/tasks/${taskId}/complete/`);
      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        await get().loadTasks(task.category.id);
      }
      return res.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  deleteTask: async (taskId) => {
    try {
      const task = get().tasks.find(t => t.id === taskId);
      await api.delete(`/todos/tasks/${taskId}/`);
      if (task) {
        await get().loadTasks(task.category.id);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // -------- random --------

  pickRandomTask: async (categoryId) => {
    try {
      const res = await api.get<TodoTask>("/todos/tasks/random/", {
        params: categoryId ? { category_id: categoryId } : {},
      });
      return res.data || null;
    } catch (e) {
      console.error("pickRandomTask", e);
      return null;
    }
  },

  checkCategoryHasTasks: async (categoryId) => {
    try {
      const res = await api.get<TodoTask[]>("/todos/tasks/", {
        params: { category_id: categoryId },
      });
      set({ hasTasksInSelectedCategory: res.data.length > 0 });
    } catch (e) {
      console.error("checkCategoryHasTasks", e);
      set({ hasTasksInSelectedCategory: false });
    }
  },

  // -------- selection --------

  setSelectedCategoryId: (id) =>
    set({
      selectedCategoryId: id,
      tasks: [],
      hasTasksInSelectedCategory: null,
    }),
}));
