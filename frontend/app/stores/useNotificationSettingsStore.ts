import { create } from "zustand";
import { api } from "../api/apiClient";

type NotificationSettingsState = {
  moodHour: number | null;
  moodMinute: number | null;
  dailyChallengeHour: number | null;
  dailyChallengeMinute: number | null;

  fetchSettings: () => Promise<void>;
  setMoodReminder: (hour: number | null, minute?: number) => Promise<void>;
};

export const useNotificationSettingsStore =
  create<NotificationSettingsState>((set, get) => ({
    moodHour: null,
    moodMinute: null,
    dailyChallengeHour: null,
    dailyChallengeMinute: null,

    fetchSettings: async () => {
      const res = await api.get("/user-preferences/");
      const prefs = res.data;

      const find = (key: string) =>
        prefs.find((p: any) => p.key === key)?.value;

      set({
        moodHour: find("mood_reminder_hour")
          ? Number(find("mood_reminder_hour"))
          : null,
        moodMinute: find("mood_reminder_minute")
          ? Number(find("mood_reminder_minute"))
          : null,
      });
    },

    setMoodReminder: async (hour, minute = 0) => {
      await api.post("/user-preferences/set/", {
        key: "mood_reminder_hour",
        value: hour,
      });

      await api.post("/user-preferences/set/", {
        key: "mood_reminder_minute",
        value: hour === null ? null : minute,
      });

      set({
        moodHour: hour,
        moodMinute: hour === null ? null : minute,
      });
    },
  }));