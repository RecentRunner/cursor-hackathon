"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatDailyQuizCountdown,
  getMillisecondsUntilNextDailyQuiz,
  getNextDailyQuizAvailableAt,
} from "@/lib/daily-quiz-storage";

type DailyQuizCountdownProps = {
  onAvailable?: () => void;
};

export function DailyQuizCountdown({ onAvailable }: DailyQuizCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getMillisecondsUntilNextDailyQuiz(),
  );
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const nextRemainingMs = getMillisecondsUntilNextDailyQuiz();
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onAvailable?.();
        }
        return;
      }

      hasNotifiedRef.current = false;
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [onAvailable]);

  const nextAvailableAt = getNextDailyQuizAvailableAt();
  const nextAvailableLabel = nextAvailableAt.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-1 pt-1">
      <p className="text-sm text-muted-foreground">
        Next check-in available in{" "}
        <span className="font-medium tabular-nums text-foreground">
          {formatDailyQuizCountdown(remainingMs)}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">
        Opens at midnight ({nextAvailableLabel})
      </p>
    </div>
  );
}
