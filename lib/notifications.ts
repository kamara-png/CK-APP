import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type ReminderSound = "default" | "silent";

let configured = false;

/**
 * Sets how notifications behave while the app is open, and (on Android)
 * creates the notification channel. Call once, near app startup.
 */
export function configureNotifications() {
  if (configured) return;
  configured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("todo-reminders", {
      name: "Todo reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}

/** Requests notification permission if not already granted. Returns whether it's usable. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function identifierFor(todoId: string) {
  return `todo-reminder-${todoId}`;
}

/**
 * Schedules (or replaces) a reminder for a todo at a specific date.
 * Uses a deterministic identifier per todo so re-scheduling or clearing
 * a reminder always replaces the previous one instead of stacking up.
 */
export async function scheduleTodoReminder(
  todoId: string,
  text: string,
  date: Date,
  sound: ReminderSound
) {
  const identifier = identifierFor(todoId);

  // Clear any existing reminder for this todo first.
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: "Todo reminder",
      body: text,
      sound: sound === "silent" ? false : true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === "android" ? "todo-reminders" : undefined,
    },
  });
}

export async function cancelTodoReminder(todoId: string) {
  await Notifications.cancelScheduledNotificationAsync(identifierFor(todoId)).catch(() => {});
}
