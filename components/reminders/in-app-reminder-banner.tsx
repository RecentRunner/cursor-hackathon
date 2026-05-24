"use client";

import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  IN_APP_REMINDER_EVENT,
  type InAppReminderPayload,
} from "@/lib/in-app-reminders";

export function InAppReminderBanner() {
  const router = useRouter();
  const [reminder, setReminder] = useState<InAppReminderPayload | null>(null);

  useEffect(() => {
    const handleReminder = (event: Event) => {
      const customEvent = event as CustomEvent<InAppReminderPayload>;
      setReminder(customEvent.detail);
    };

    window.addEventListener(IN_APP_REMINDER_EVENT, handleReminder);

    return () => {
      window.removeEventListener(IN_APP_REMINDER_EVENT, handleReminder);
    };
  }, []);

  if (!reminder) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 z-[60] px-4 pb-[env(safe-area-inset-bottom,0px)]"
      style={{
        bottom:
          "calc(var(--app-viewport-bottom-offset, 0px) + var(--app-nav-offset, var(--bottom-nav-height)) + 0.5rem)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-xl border border-primary/30 bg-card p-4 shadow-lg">
        <div className="rounded-full bg-primary/10 p-2">
          <Bell aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-medium leading-tight">{reminder.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{reminder.body}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setReminder(null);
                router.push(reminder.targetUrl);
              }}
            >
              Open Bit tab
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setReminder(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          aria-label="Dismiss reminder"
          onClick={() => setReminder(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
