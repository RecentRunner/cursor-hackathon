"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getDailyReminderStatus } from "@/lib/daily-reminder-status";
import {
  getNotificationPermissionState,
  getReminderCheckIntervalMs,
  hasReachedReminderTime,
  markDailyReminderSentToday,
  showDailyReminderNotification,
  wasDailyReminderSentToday,
} from "@/lib/daily-reminders";
import {
  getProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profile-preferences-storage";

export function DailyReminderProvider() {
  const [preferences, setPreferences] = useState<ProfilePreferences | null>(
    null,
  );
  const isCheckingRef = useRef(false);

  const loadPreferences = useCallback(async () => {
    try {
      const nextPreferences = await getProfilePreferences();
      setPreferences(nextPreferences);
      return nextPreferences;
    } catch {
      setPreferences(null);
      return null;
    }
  }, []);

  const runReminderCheck = useCallback(
    async (activePreferences = preferences) => {
      if (isCheckingRef.current) {
        return;
      }

      isCheckingRef.current = true;

      try {
        if (!activePreferences?.dailyReminderEnabled) {
          return;
        }

        if (getNotificationPermissionState() !== "granted") {
          return;
        }

        const status = await getDailyReminderStatus();

        if (wasDailyReminderSentToday(status.dateKey)) {
          return;
        }

        if (!hasReachedReminderTime(activePreferences.dailyReminderTime)) {
          return;
        }

        if (status.needsReminder) {
          showDailyReminderNotification(status);
        }

        markDailyReminderSentToday(status.dateKey);
      } finally {
        isCheckingRef.current = false;
      }
    },
    [preferences],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const loadedPreferences = await loadPreferences();

      if (!cancelled && loadedPreferences) {
        await runReminderCheck(loadedPreferences);
      }
    }

    void initialize();

    const handleDataUpdated = () => {
      void (async () => {
        const loadedPreferences = await loadPreferences();

        if (loadedPreferences) {
          await runReminderCheck(loadedPreferences);
        }
      })();
    };

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [loadPreferences, runReminderCheck]);

  useEffect(() => {
    if (!preferences) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void runReminderCheck(preferences);
    }, getReminderCheckIntervalMs());

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void runReminderCheck(preferences);
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [preferences, runReminderCheck]);

  return null;
}
