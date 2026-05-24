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
            <Input id="email" value={email ?? "Guest user"} readOnly />
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
                void updatePreferences({ dailyReminderEnabled: checked === true })
              }
            />
          </div>
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
