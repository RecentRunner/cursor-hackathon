"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { hasCompletedDailyQuizToday } from "@/lib/daily-quiz-storage";
import { routes } from "@/lib/routes";

export function DailyQuizLinkButton() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      setIsCompleted(await hasCompletedDailyQuizToday());
      setIsReady(true);
    }

    void loadStatus();
  }, []);

  if (!isReady || isCompleted) {
    return (
      <Button className="w-full" variant="outline" disabled>
        Open daily quiz
      </Button>
    );
  }

  return (
    <Button asChild className="w-full" variant="outline">
      <Link href={`${routes.avatar}#bit-daily-quiz`}>Open daily quiz</Link>
    </Button>
  );
}
