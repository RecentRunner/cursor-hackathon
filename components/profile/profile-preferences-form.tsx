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

  useEffect(() => {
    setPreferences(getProfilePreferences());
    setIsReady(true);
  }, []);

  const updatePreferences = (updates: Partial<ProfilePreferences>) => {
    const nextPreferences = { ...preferences, ...updates };
    setPreferences(nextPreferences);
    saveProfilePreferences(nextPreferences);
  };

  const toggleFocusTopic = (topic: string) => {
    const focusTopics = preferences.focusTopics.includes(topic)
      ? preferences.focusTopics.filter((item) => item !== topic)
      : [...preferences.focusTopics, topic];

    updatePreferences({ focusTopics });
  };

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">Loading profile...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
          <CardTitle className="text-base">Focus topic preferences</CardTitle>
          <CardDescription>
            Choose the areas you want your pet and daily tasks to focus on.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {focusTopicOptions.map((topic) => (
            <div key={topic} className="flex items-center gap-3 rounded-lg border p-3">
              <Checkbox
                id={`focus-${topic}`}
                checked={preferences.focusTopics.includes(topic)}
                onCheckedChange={() => toggleFocusTopic(topic)}
              />
              <Label htmlFor={`focus-${topic}`}>{topic}</Label>
            </div>
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
              variant={preferences.avatarVibe === vibe ? "default" : "outline"}
              onClick={() => updatePreferences({ avatarVibe: vibe })}
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
              checked={preferences.dailyReminderEnabled}
              onCheckedChange={(checked) =>
                updatePreferences({ dailyReminderEnabled: checked === true })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time">Daily reminder time</Label>
            <Input
              id="reminder-time"
              type="time"
              value={preferences.dailyReminderTime}
              disabled={!preferences.dailyReminderEnabled}
              onChange={(event) =>
                updatePreferences({ dailyReminderTime: event.target.value })
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
