"use client";

import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearDailyReminderSentToday,
  deliverTestDailyReminder,
  getNotificationPermissionLabel,
  getNotificationPermissionState,
  isNotificationSupported,
  requestNotificationPermission,
} from "@/lib/daily-reminders";
import { getDailyReminderStatus } from "@/lib/daily-reminder-status";
import { getTodayDateKey } from "@/lib/habits-storage";
import {
  reminderDeliveryOptions,
  usesSystemReminders,
  type ReminderDeliveryMethod,
} from "@/lib/reminder-delivery";
import {
  avatarVibeOptions,
  defaultProfilePreferences,
  focusTopicOptions,
  getProfilePreferences,
  saveProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profile-preferences-storage";

type ProfilePreferencesFormProps = {
  email?: string | null;
};

export function ProfilePreferencesForm({ email }: ProfilePreferencesFormProps) {
  const [preferences, setPreferences] = useState<ProfilePreferences>(
    defaultProfilePreferences,
  );
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermissionState(),
  );
  const [notificationMessage, setNotificationMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setNotificationPermission(getNotificationPermissionState());
  }, []);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setPreferences(await getProfilePreferences());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load profile preferences.",
        );
      } finally {
        setIsReady(true);
      }
    }

    void loadPreferences();
  }, []);

  const updatePreferences = async (updates: Partial<ProfilePreferences>) => {
    const nextPreferences = { ...preferences, ...updates };
    setPreferences(nextPreferences);
    setIsSaving(true);
    setError(null);

    try {
      const savedPreferences = await saveProfilePreferences(nextPreferences);
      setPreferences(savedPreferences);

      if (
        "dailyReminderEnabled" in updates ||
        "dailyReminderTime" in updates ||
        "dailyReminderDelivery" in updates
      ) {
        clearDailyReminderSentToday(getTodayDateKey());
      }
    } catch (saveError) {
      setPreferences(preferences);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save profile preferences.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const ensureSystemReminderPermission = async (
    deliveryMethod: ReminderDeliveryMethod,
  ) => {
    if (!usesSystemReminders(deliveryMethod)) {
      return true;
    }

    if (!isNotificationSupported()) {
      setError("This browser does not support browser (OS) notifications.");
      return false;
    }

    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);

    if (permission !== "granted") {
      setError(
        permission === "denied"
          ? "Browser notifications are blocked. Enable them in your browser settings or choose In-app delivery."
          : "Browser notification permission was not granted.",
      );
      return false;
    }

    return true;
  };

  const handleDailyReminderToggle = async (checked: boolean) => {
    if (checked) {
      const allowed = await ensureSystemReminderPermission(
        preferences.dailyReminderDelivery,
      );

      if (!allowed) {
        return;
      }
    }

    setError(null);
    await updatePreferences({ dailyReminderEnabled: checked });
  };

  const handleDeliveryMethodChange = async (
    deliveryMethod: ReminderDeliveryMethod,
  ) => {
    if (
      preferences.dailyReminderEnabled &&
      usesSystemReminders(deliveryMethod)
    ) {
      const allowed = await ensureSystemReminderPermission(deliveryMethod);

      if (!allowed) {
        return;
      }
    }

    setError(null);
    await updatePreferences({ dailyReminderDelivery: deliveryMethod });
  };

  const handleTestNotification = async () => {
    setNotificationMessage(null);
    setError(null);

    const deliveryMethod = preferences.dailyReminderDelivery;

    if (usesSystemReminders(deliveryMethod)) {
      const allowed = await ensureSystemReminderPermission(deliveryMethod);

      if (!allowed) {
        return;
      }
    }

    const status = await getDailyReminderStatus();
    const shown = deliverTestDailyReminder(status, deliveryMethod);

    if (!shown) {
      setError("Could not show a test reminder.");
      return;
    }

    if (deliveryMethod === "in_app") {
      setNotificationMessage(
        "In-app test reminder sent. Look for the banner above the bottom navigation.",
      );
      return;
    }

    if (deliveryMethod === "system") {
      setNotificationMessage(
        "Browser test notification sent. Check your browser or OS notification center.",
      );
      return;
    }

    setNotificationMessage(
      "Test reminder sent in-app and through your browser notification center.",
    );
  };

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">Loading profile...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile information</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email ?? "Guest user"}
              readOnly
              disabled
              className="field-locked"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Focus topic preference</CardTitle>
          <CardDescription>
            Choose the one area you want your pet and daily tasks to focus on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {focusTopicOptions.map((topic) => (
            <Button
              key={topic}
              type="button"
              variant={preferences.focusTopic === topic ? "default" : "outline"}
              className="w-full justify-start"
              disabled={isSaving}
              onClick={() => void updatePreferences({ focusTopic: topic })}
            >
              {topic}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avatar preferences</CardTitle>
          <CardDescription>Personalize your pet&apos;s vibe.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {avatarVibeOptions.map((vibe) => (
            <Button
              key={vibe}
              type="button"
              size="sm"
              disabled={isSaving}
              variant={preferences.avatarVibe === vibe ? "default" : "outline"}
              onClick={() => void updatePreferences({ avatarVibe: vibe })}
            >
              {vibe}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification preferences</CardTitle>
          <CardDescription>
            Control reminders for your daily quiz and habits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <Label htmlFor="daily-reminder">Daily reminder</Label>
            <Checkbox
              id="daily-reminder"
              disabled={isSaving}
              checked={preferences.dailyReminderEnabled}
              onCheckedChange={(checked) =>
                void handleDailyReminderToggle(checked === true)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Reminder delivery</Label>
            <div className="space-y-2">
              {reminderDeliveryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleDeliveryMethodChange(option.value)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                    preferences.dailyReminderDelivery === option.value
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          {usesSystemReminders(preferences.dailyReminderDelivery) ? (
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <span className="text-sm">Browser permission</span>
              <Badge variant="secondary">
                {getNotificationPermissionLabel(notificationPermission)}
              </Badge>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Daily reminder time</Label>
            <Input
              id="reminder-time"
              type="time"
              disabled={isSaving || !preferences.dailyReminderEnabled}
              value={preferences.dailyReminderTime}
              onChange={(event) =>
                void updatePreferences({ dailyReminderTime: event.target.value })
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            In-app reminders appear inside Habit Pet while a tab is open.
            Browser (OS) reminders use the Web Notifications API and may appear
            in your system notification center. Reminders fire once per day at
            your chosen local time.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSaving}
            onClick={() => void handleTestNotification()}
          >
            Send test reminder
          </Button>
          {notificationMessage ? (
            <p className="text-xs text-emerald-600">{notificationMessage}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account settings</CardTitle>
          <CardDescription>Session and onboarding status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm">Onboarding</span>
            <Badge variant="secondary">Complete</Badge>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
