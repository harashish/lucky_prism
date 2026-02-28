import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { NOTIFICATION_IDS } from "./notificationIds";

class NotificationEngine {
  private initialized = false;

  /*
  ========================
  INIT / PERMISSIONS
  ========================
  */

  async init() {
    if (this.initialized) return;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    this.initialized = true;
  }

  /*
  ========================
  GENERIC
  ========================
  */

  async cancel(id: string) {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    const match = all.find((n) => n.identifier === id);
    if (match) {
      await Notifications.cancelScheduledNotificationAsync(match.identifier);
    }
  }

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /*
  ========================
  HABITS
  ========================
  */

async scheduleDailyHabitsCheck(
  hour?: number,
  minute?: number,
  delaySeconds?: number
) {
  await this.cancel(NOTIFICATION_IDS.HABITS_DAILY);

  const trigger = delaySeconds
    ? {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      }
    : {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.HABITS_DAILY,
    content: {
      title: "Habits",
      body: "Mark today’s habits.",
      data: { screen: "HabitsScreen" },
    },
          trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
  });
}

  /*
  ========================
  MOOD
  ========================
  */

async scheduleMoodReminder(
  hour?: number,
  minute?: number,
  delaySeconds?: number
) {
  await this.cancel(NOTIFICATION_IDS.MOOD_REMINDER);

  const trigger = delaySeconds
    ? {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      }
    : {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MOOD_REMINDER,
    content: {
      title: "Mood check",
      body: "How do you feel today?",
      data: { screen: "MoodScreen" },
    },
              trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
  });
}
  /*
  ========================
  DAILY CHALLENGE
  ========================
  */

async scheduleDailyChallengeReminder(
  hour?: number,
  minute?: number,
  delaySeconds?: number
) {
  await this.cancel(NOTIFICATION_IDS.DAILY_CHALLENGE);

  const trigger = delaySeconds
    ? {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      }
    : {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.DAILY_CHALLENGE,
    content: {
      title: "Daily challenge",
      body: "Your daily challenge is active.",
      data: { screen: "ChallengesScreen" },
    },
            trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
  });
}

  /*
  ========================
  RANDOM NOTE
  ========================
  */

async scheduleRandomNote(
  notes?: { content: string }[],
  delaySeconds?: number
) {
  if (!notes || notes.length === 0) return;

  await this.cancel(NOTIFICATION_IDS.RANDOM_NOTE);

  const note = notes[Math.floor(Math.random() * notes.length)];

  const trigger = delaySeconds
    ? {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delaySeconds,
      }
    : {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour: Math.floor(Math.random() * 9) + 12,
        minute: Math.floor(Math.random() * 60),
        repeats: false,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.RANDOM_NOTE,
    content: {
      title: "Random note",
      body: note.content,
      data: { screen: "NotesScreen" },
    },
            trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
  });
}

  /*
  ========================
  TEST HELPERS
  ========================
  */

  async testHabits() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TEST Habits",
        body: "Test habits notification",
        data: { screen: "HabitsScreen" },
      },
      trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
    });
  }

  async testMood() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TEST Mood",
        body: "Test mood notification",
        data: { screen: "MoodScreen" },
      },
      trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
    });
  }

  async testChallenge() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TEST Challenge",
        body: "Test daily challenge notification",
        data: { screen: "ChallengesScreen" },
      },
      trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
    });
  }

  async testRandomNote() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "TEST Random Note",
        body: "Random note example",
        data: { screen: "NotesScreen" },
      },
      trigger: {
  type: SchedulableTriggerInputTypes.TIME_INTERVAL,
  seconds: 5,
}
    });
  }

  /*
  ========================
  DEEP LINK HANDLER
  ========================
  */

  registerNavigationHandler(router: any) {
    Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen) {
        router.push(`/${screen}`);
      }
    });
  }
}

export const notificationEngine = new NotificationEngine();