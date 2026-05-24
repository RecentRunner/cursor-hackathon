"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
import {
  getAvatarConditionForToday,
  hasCompletedDailyQuizToday,
} from "@/lib/daily-quiz-storage";
import { routes } from "@/lib/routes";

export function AvatarStatusCard() {
  const [condition, setCondition] = useState<AvatarCondition>(
    defaultAvatarCondition,
  );
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      const checkedIn = await hasCompletedDailyQuizToday();
      setHasCheckedInToday(checkedIn);
      setCondition((await getAvatarConditionForToday()) ?? defaultAvatarCondition);
      setIsReady(true);
    }

    void loadStatus();
  }, []);

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
            ? "Your pet is reacting to today's wellness check-in and journal."
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
