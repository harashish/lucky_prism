import { notificationEngine } from "./notificationEngine";
import { useHabitStore } from "../stores/useHabitStore";
import { useNotesStore } from "../stores/useNotesStore";
import { useChallengeStore } from "../stores/useChallengeStore";

const DEFAULT_HOUR = 20;
const DEFAULT_MINUTE = 0;

export async function bootstrapNotifications() {
  console.log("BOOTSTRAP START");

  // 1️⃣ wyczyść wszystko
  await notificationEngine.cancelAll();

  // 2️⃣ HABITS (1 global reminder)
  await notificationEngine.scheduleDailyHabitsCheck(
    DEFAULT_HOUR,
    DEFAULT_MINUTE
  );

  // 3️⃣ MOOD (1 global reminder)
  await notificationEngine.scheduleMoodReminder(
    DEFAULT_HOUR,
    DEFAULT_MINUTE
  );

  // 4️⃣ DAILY CHALLENGE (tylko jeśli aktywny)
  const { challenges } = useChallengeStore.getState();

  const isDailyActive = challenges?.some(
    (c: any) => c.type === "daily" && c.is_active
  );

  if (isDailyActive) {
    await notificationEngine.scheduleDailyChallengeReminder(
      DEFAULT_HOUR,
      DEFAULT_MINUTE
    );
  }

  // 5️⃣ RANDOM NOTE (1 dziennie 12–20)
  const { notes } = useNotesStore.getState();

  if (notes?.length) {
    await notificationEngine.scheduleRandomNote(notes);
  }

  console.log("BOOTSTRAP DONE");
}