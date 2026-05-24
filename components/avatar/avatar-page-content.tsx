"use client";

import { useCallback, useEffect, useState } from "react";

import { DailyQuizForm } from "@/components/daily-quiz/daily-quiz-form";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { JournalCalendar } from "@/components/journal/journal-calendar";
import { PetHabitat } from "@/components/pet/pet-habitat";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";

export function AvatarPageContent() {
  const [customization, setCustomization] = useState<AvatarCustomization | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCustomization = useCallback(async () => {
    try {
      setLoadError(null);
      setCustomization(await getAvatarCustomization());
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load your avatar.",
      );
    }
  }, []);

  useEffect(() => {
    void loadCustomization();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadCustomization);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadCustomization);
    };
  }, [loadCustomization]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (hash === "bit-daily-quiz") {
      window.location.hash = "bit-daily-check-in";
    }
  }, []);

  if (loadError) {
    return <p className="text-xs text-red-500">{loadError}</p>;
  }

  if (!customization) {
    return (
      <p className="text-xs text-muted-foreground">Loading your bit...</p>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="bit-home-pet-stage">
        <PetHabitat
          customization={customization}
          fillViewport
          nameEditable
          onNameChange={(name) =>
            setCustomization((current) =>
              current ? { ...current, name } : current,
            )
          }
        />
      </div>

      <section className="grid w-full gap-6 pt-6 lg:grid-cols-2 lg:items-start">
        <div id="bit-daily-tasks">
          <HabitTracker mode="daily" />
        </div>
        <div id="bit-daily-check-in">
          <DailyQuizForm />
        </div>
      </section>

      <section className="w-full pt-8">
        <JournalCalendar />
      </section>
    </div>
  );
}
