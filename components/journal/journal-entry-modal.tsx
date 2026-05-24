"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { WellnessSlider } from "@/components/daily-quiz/wellness-slider";
import { Button } from "@/components/ui/button";
import {
  formatSleepHours,
  SLEEP_HOURS_MAX,
  SLEEP_HOURS_MIN,
  SLEEP_HOURS_STEP,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";

type JournalEntryModalProps = {
  entry: DailyQuizSubmission | null;
  onClose: () => void;
};

function formatEntryDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function JournalEntryModal({ entry, onClose }: JournalEntryModalProps) {
  useEffect(() => {
    if (!entry) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [entry, onClose]);

  if (!entry) {
    return null;
  }

  const journalText = entry.journal.trim();

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-entry-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Journal entry
            </p>
            <h2
              id="journal-entry-title"
              className="truncate text-lg font-semibold tracking-tight"
            >
              {formatEntryDateLabel(entry.date)}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label="Close journal entry"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Daily journal</p>
            <p className="whitespace-pre-wrap rounded-lg border bg-muted/20 px-3 py-3 text-sm text-foreground">
              {journalText || "No journal written."}
            </p>
          </div>

          <div className="space-y-4 rounded-lg border px-3 py-4">
            <p className="text-sm font-medium">Wellness</p>
            <WellnessSlider
              id="journal-feeling"
              label="How were you feeling?"
              value={entry.answers.feeling}
              disabled
              onChange={() => undefined}
            />
            <WellnessSlider
              id="journal-stress"
              label="Stress level"
              value={entry.answers.stress}
              disabled
              onChange={() => undefined}
            />
            <WellnessSlider
              id="journal-energy"
              label="Energy level"
              value={entry.answers.energy}
              disabled
              onChange={() => undefined}
            />
            <WellnessSlider
              id="journal-sleep-length"
              label="Sleep length"
              value={entry.answers.sleepLength}
              min={SLEEP_HOURS_MIN}
              max={SLEEP_HOURS_MAX}
              step={SLEEP_HOURS_STEP}
              formatValue={formatSleepHours}
              disabled
              onChange={() => undefined}
            />
            <WellnessSlider
              id="journal-sleep-quality"
              label="Sleep quality"
              value={entry.answers.sleepQuality}
              disabled
              onChange={() => undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
