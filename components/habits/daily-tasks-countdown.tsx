"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatCountdownDuration,
  getMillisecondsUntilLocalMidnight,
  getNextLocalMidnight,
} from "@/lib/date-keys";
import { cn } from "@/lib/utils";

type DailyTasksCountdownProps = {
  className?: string;
  onDayChange?: () => void;
};

export function DailyTasksCountdown({
  className,
  onDayChange,
}: DailyTasksCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    getMillisecondsUntilLocalMidnight(),
  );
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const nextRemainingMs = getMillisecondsUntilLocalMidnight();
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        if (!hasNotifiedRef.current) {
          hasNotifiedRef.current = true;
          onDayChange?.();
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
  }, [onDayChange]);

  const resetsAtLabel = getNextLocalMidnight().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/30 px-3 py-2",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Time remaining today{" "}
        <span className="font-medium tabular-nums text-foreground">
          {formatCountdownDuration(remainingMs)}
        </span>
      </p>
      <p className="text-xs text-muted-foreground">
        Tasks reset at midnight ({resetsAtLabel})
      </p>
    </div>
  );
}
