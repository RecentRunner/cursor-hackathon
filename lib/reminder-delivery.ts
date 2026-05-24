export const reminderDeliveryOptions = [
  {
    value: "in_app",
    label: "In-app",
    description:
      "Show reminders inside HaBit when you have the site open in a tab.",
  },
  {
    value: "system",
    label: "Browser (OS)",
    description:
      "Use the Web Notifications API. Your browser may show these in the Windows or macOS notification center.",
  },
  {
    value: "both",
    label: "Both",
    description: "In-app banners plus browser notifications when permitted.",
  },
] as const;

export type ReminderDeliveryMethod =
  (typeof reminderDeliveryOptions)[number]["value"];

export function isReminderDeliveryMethod(
  value: string | undefined,
): value is ReminderDeliveryMethod {
  return reminderDeliveryOptions.some((option) => option.value === value);
}

export function normalizeReminderDeliveryMethod(
  value: string | undefined,
): ReminderDeliveryMethod {
  if (value && isReminderDeliveryMethod(value)) {
    return value;
  }

  return "in_app";
}

export function usesInAppReminders(method: ReminderDeliveryMethod) {
  return method === "in_app" || method === "both";
}

export function usesSystemReminders(method: ReminderDeliveryMethod) {
  return method === "system" || method === "both";
}

export function getReminderDeliveryLabel(method: ReminderDeliveryMethod) {
  return (
    reminderDeliveryOptions.find((option) => option.value === method)?.label ??
    "In-app"
  );
}
