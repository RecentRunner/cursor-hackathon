import { routes } from "@/lib/routes";

export const IN_APP_REMINDER_EVENT = "habit-pet-in-app-reminder";

export type InAppReminderPayload = {
  title: string;
  body: string;
  targetUrl: string;
  isTest?: boolean;
};

export function dispatchInAppReminder(payload: InAppReminderPayload) {
  if (typeof window === "undefined") {
    return false;
  }

  window.dispatchEvent(
    new CustomEvent<InAppReminderPayload>(IN_APP_REMINDER_EVENT, {
      detail: payload,
    }),
  );

  return true;
}

export function showInAppDailyReminder(input: {
  title: string;
  body: string;
  targetUrl?: string;
  isTest?: boolean;
}) {
  return dispatchInAppReminder({
    title: input.title,
    body: input.body,
    targetUrl: input.targetUrl ?? routes.avatar,
    isTest: input.isTest,
  });
}
