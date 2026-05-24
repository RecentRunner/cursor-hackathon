"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { CharacterLayerPreview } from "@/components/character/character-layer-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AvatarCustomization } from "@/lib/avatar-customization-storage";
import {
  defaultAvatarCondition,
  WELLNESS_SCALE_MAX,
  type AvatarCondition,
} from "@/lib/avatar-state";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarConditionForToday,
  hasCompletedDailyQuizToday,
} from "@/lib/daily-quiz-storage";
import { getCompletedHabitLabelsForToday } from "@/lib/habits-storage";
import { routes } from "@/lib/routes";

type AvatarStatusCardProps = {
  customization: AvatarCustomization;
};

export function AvatarStatusCard({ customization }: AvatarStatusCardProps) {
  const [condition, setCondition] = useState<AvatarCondition>(
    defaultAvatarCondition,
  );
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [completedTaskCount, setCompletedTaskCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const loadStatus = useCallback(async () => {
    const [checkedIn, nextCondition, completedLabels] = await Promise.all([
      hasCompletedDailyQuizToday(),
      getAvatarConditionForToday(),
      getCompletedHabitLabelsForToday(),
    ]);

    setHasCheckedInToday(checkedIn);
    setCondition(nextCondition ?? defaultAvatarCondition);
    setCompletedTaskCount(completedLabels.length);
    setIsReady(true);
  }, []);

  useEffect(() => {
    void loadStatus();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadStatus);

    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, loadStatus);
    };
  }, [loadStatus]);

  if (!isReady) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Loading your bit...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <div className="text-center">
          <p className="text-lg font-semibold tracking-tight">
            {customization.name}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {condition.mood}
          </p>
        </div>
        <CharacterLayerPreview
          colors={customization.colors}
          variants={customization.variants}
          equippedItems={customization.equippedItems}
          scale={8}
          className="w-full max-w-xs"
        />
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">
            Energy {condition.energy}/{WELLNESS_SCALE_MAX}
          </Badge>
          <Badge variant="secondary">
            Health {condition.health}/{WELLNESS_SCALE_MAX}
          </Badge>
          <Badge variant={hasCheckedInToday ? "default" : "outline"}>
            {hasCheckedInToday ? "Checked in today" : "Quiz pending"}
          </Badge>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {hasCheckedInToday
            ? completedTaskCount > 0
              ? `Your bit reacts to today's quiz and ${completedTaskCount} completed task${completedTaskCount === 1 ? "" : "s"}. Meals, hydration, sleep, and relaxing habits boost health and mood.`
              : "Your bit is reacting to today's wellness check-in. Complete habits to boost mood, energy, and health."
            : completedTaskCount > 0
              ? "Complete today's quiz for a full wellness read, then keep completing habits to boost your bit."
              : "Complete today's quiz to update your bit's mood, energy, and health."}
        </p>
        {!hasCheckedInToday ? (
          <Button asChild className="w-full">
            <Link href={`${routes.avatar}#bit-daily-quiz`}>Take today&apos;s quiz</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
