"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PixelAvatar } from "@/components/avatar/pixel-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

export function AvatarStatusCard() {
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
            Loading your pet...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <PixelAvatar mood={condition.mood} />
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
              ? `Your pet reacts to today's quiz and ${completedTaskCount} completed task${completedTaskCount === 1 ? "" : "s"}. Meals, hydration, sleep, and relaxing habits boost health and mood.`
              : "Your pet is reacting to today's wellness check-in. Complete habits to boost mood, energy, and health."
            : completedTaskCount > 0
              ? "Complete today's quiz for a full wellness read, then keep completing habits to boost your pet."
              : "Complete today's quiz to update your pet's mood, energy, and health."}
        </p>
        {!hasCheckedInToday ? (
          <Button asChild className="w-full">
            <Link href={routes.dailyQuiz}>Take today&apos;s quiz</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
