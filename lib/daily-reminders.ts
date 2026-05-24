import type { DailyReminderStatus } from "@/lib/daily-reminder-status";
import { showInAppDailyReminder } from "@/lib/in-app-reminders";
import { routes } from "@/lib/routes";
import {
  type ReminderDeliveryMethod,
  usesInAppReminders,
  usesSystemReminders,
} from "@/lib/reminder-delivery";

const REMINDER_SENT_STORAGE_PREFIX = "habit-pet-daily-reminder-sent";
const REMINDER_CHECK_INTERVAL_MS = 15_000;

export type NotificationPermissionState =
  | "default"
  | "granted"
  | "denied"
  | "unsupported";

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionState(): NotificationPermissionState {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const permission = await Notification.requestPermission();

  return permission === "default" ? "default" : permission;
}

export function parseReminderTime(reminderTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(reminderTime.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function hasReachedReminderTime(
  reminderTime: string,
  now = new Date(),
) {
  const reminderMinutes = parseReminderTime(reminderTime);

  if (reminderMinutes === null) {
    return false;
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return nowMinutes >= reminderMinutes;
}

function getReminderSentStorageKey(dateKey: string) {
  return `${REMINDER_SENT_STORAGE_PREFIX}:${dateKey}`;
}

export function wasDailyReminderSentToday(dateKey: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(getReminderSentStorageKey(dateKey)) === "1"
  );
}

export function markDailyReminderSentToday(dateKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getReminderSentStorageKey(dateKey), "1");
}

export function clearDailyReminderSentToday(dateKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getReminderSentStorageKey(dateKey));
}

export function buildDailyReminderNotification(status: DailyReminderStatus) {
  const targetUrl = routes.avatar;

  if (!status.quizCompleted && status.incompleteTaskCount > 0) {
    return {
      title: "Time for your daily check-in",
      body: `Complete today's wellness quiz and ${status.incompleteTaskCount} remaining habit${status.incompleteTaskCount === 1 ? "" : "s"}.`,
      targetUrl,
    };
  }

  if (!status.quizCompleted) {
    return {
      title: "Time for your daily check-in",
      body: "Complete today's wellness quiz to keep your pet happy.",
      targetUrl,
    };
  }

  return {
    title: "Habit reminder",
    body: `You have ${status.incompleteTaskCount} habit${status.incompleteTaskCount === 1 ? "" : "s"} left for today.`,
    targetUrl,
  };
}

export function showSystemDailyReminderNotification(
  status: DailyReminderStatus,
) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const { title, body, targetUrl } = buildDailyReminderNotification(status);
  const notification = new Notification(title, {
    body,
    tag: `habit-pet-daily-reminder-${status.dateKey}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();

    if (window.location.pathname !== targetUrl) {
      window.location.assign(targetUrl);
    }
  };

  return true;
}

export function showTestSystemDailyReminderNotification(
  status: DailyReminderStatus,
) {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const { body, targetUrl } = buildDailyReminderNotification(status);
  const notification = new Notification("Test: Habit Pet reminder", {
    body: `This is a browser test notification. ${body}`,
    tag: `habit-pet-daily-reminder-test-${Date.now()}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();

    if (window.location.pathname !== targetUrl) {
      window.location.assign(targetUrl);
    }
  };

  return true;
}

export function deliverDailyReminder(
  status: DailyReminderStatus,
  deliveryMethod: ReminderDeliveryMethod,
) {
  let delivered = false;

  if (usesInAppReminders(deliveryMethod)) {
    const { title, body, targetUrl } = buildDailyReminderNotification(status);
    delivered =
      showInAppDailyReminder({ title, body, targetUrl }) || delivered;
  }

  if (usesSystemReminders(deliveryMethod)) {
    delivered =
      showSystemDailyReminderNotification(status) || delivered;
  }

  return delivered;
}

export function deliverTestDailyReminder(
  status: DailyReminderStatus,
  deliveryMethod: ReminderDeliveryMethod,
) {
  let delivered = false;

  if (usesInAppReminders(deliveryMethod)) {
    const { title, body, targetUrl } = buildDailyReminderNotification(status);
    delivered =
      showInAppDailyReminder({
        title: `Test: ${title}`,
        body: `This is an in-app test reminder. ${body}`,
        targetUrl,
        isTest: true,
      }) || delivered;
  }

  if (usesSystemReminders(deliveryMethod)) {
    delivered =
      showTestSystemDailyReminderNotification(status) || delivered;
  }

  return delivered;
}

/** @deprecated Use showSystemDailyReminderNotification */
export function showDailyReminderNotification(status: DailyReminderStatus) {
  return showSystemDailyReminderNotification(status);
}

/** @deprecated Use showTestSystemDailyReminderNotification */
export function showTestDailyReminderNotification(status: DailyReminderStatus) {
  return showTestSystemDailyReminderNotification(status);
}

export function getReminderCheckIntervalMs() {
  return REMINDER_CHECK_INTERVAL_MS;
}

export function getNotificationPermissionLabel(
  permission: NotificationPermissionState,
) {
  switch (permission) {
    case "granted":
      return "Allowed";
    case "denied":
      return "Blocked";
    case "default":
      return "Not requested";
    default:
      return "Unsupported";
  }
}
