import { create } from "zustand";
import { api } from "../api/apiClient";

export interface DifficultyType { id: number; name: string; xp_value: number; }

export interface TodoCategory {
  id: number;
  name: string;
  color?: string;
  difficulty?: DifficultyType;
}

export interface TodoTask {
  id: number;
  user: number;
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

  loadCategories: () => Promise<void>;
  loadTasks: (userId?: number, categoryId?: number) => Promise<void>;
  addCategory: (payload: any) => Promise<TodoCategory | null>;
  saveCategory: (id: number, payload: any) => Promise<boolean>;
  deleteCategory: (id: number) => Promise<boolean>;
  quickAddTask: (userId: number, categoryId: number, content: string, customDifficultyId?: number | null) => Promise<TodoTask | null>;
  completeTask: (taskId: number) => Promise<{ xp_gained: number; total_xp: number; current_level: number } | null>;
  deleteTask: (taskId: number) => Promise<boolean>;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  categories: [],
  tasks: [],
  loading: false,

  loadCategories: async () => {
    set({ loading: true });
    try {
      const res = await api.get<TodoCategory[]>("/todos/categories/");
      set({ categories: res.data });
    } catch (e: any) {
      console.error("loadCategories", e.response?.data || e.message || e);
    } finally {
      set({ loading: false });
    }
  },

  loadTasks: async (userId = 1, categoryId?: number) => {
    set({ loading: true });
    try {
      const params: any = { user_id: userId };
      if (categoryId) params.category_id = categoryId;
      const res = await api.get<TodoTask[]>("/todos/tasks/", { params });
      set({ tasks: res.data });
    } catch (e: any) {
      console.error("loadTasks", e.response?.data || e.message || e);
    } finally {
      set({ loading: false });
    }
  },

  addCategory: async (payload) => {
    try {
      const res = await api.post("/todos/categories/", payload);
      await get().loadCategories();
      return res.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  },

  saveCategory: async (id, payload) => {
    try {
      await api.patch(`/todos/categories/${id}/`, payload);
      await get().loadCategories();
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  },

  deleteCategory: async (id) => {
    try {
      await api.delete(`/todos/categories/${id}/`);
      await get().loadCategories();
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  },

  quickAddTask: async (userId, categoryId, content, customDifficultyId = null) => {
    try {
      const payload: any = { user_id: userId, category_id: categoryId, content };
      if (customDifficultyId) payload.custom_difficulty_id = customDifficultyId;
      const res = await api.post("/todos/tasks/", payload);
      await get().loadTasks(userId, categoryId);
      return res.data;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  },

  completeTask: async (taskId) => {
  try {
    const res = await api.post(`/todos/tasks/${taskId}/complete/`);

    // Znajdź kategorię ukończonego taska
    const currentTasks = get().tasks;
    const task = currentTasks.find(t => t.id === taskId);
    const categoryId = task?.category?.id;

    // Odśwież tylko jedną kategorię (to naprawia bug)
    await get().loadTasks(1, categoryId);

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
},

deleteTask: async (taskId) => {
  try {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    const categoryId = task?.category?.id;

    await api.delete(`/todos/tasks/${taskId}/`);
    await get().loadTasks(1, categoryId);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
},

randomTask: async (userId = 1, categoryId?: number) => {
  try {
    const params: any = { user_id: userId };
    if (categoryId) params.category_id = categoryId;

    const res = await api.get<TodoTask[]>("/todos/tasks/", { params });
    const list = res.data;
    if (!list.length) return null;

    return list[Math.floor(Math.random() * list.length)];
  } catch (e: any) {
    console.log("randomTask error:", e.response?.data || e.message);
    return null;
  }
},


}));
