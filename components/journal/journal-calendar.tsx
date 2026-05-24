"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { JournalEntryModal } from "@/components/journal/journal-entry-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import type { DailyQuizSubmission } from "@/lib/avatar-state";
import {
  getDailyEntryByDate,
  getDailyEntrySummariesForMonth,
  getTodayDateKey,
  type DailyEntrySummary,
} from "@/lib/daily-quiz-storage";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarCell = {
  dateKey: string;
  day: number;
  inMonth: boolean;
};

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const grid: CalendarCell[] = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    const date = new Date(year, month, index - firstDay.getDay() + 1);
    grid.push({
      dateKey: date.toLocaleDateString("en-CA"),
      day: date.getDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    grid.push({
      dateKey: date.toLocaleDateString("en-CA"),
      day,
      inMonth: true,
    });
  }

  let trailingDay = 1;
  while (grid.length % 7 !== 0) {
    const date = new Date(year, month + 1, trailingDay);
    grid.push({
      dateKey: date.toLocaleDateString("en-CA"),
      day: date.getDate(),
      inMonth: false,
    });
    trailingDay += 1;
  }

  return grid;
}

function formatMonthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function JournalCalendar() {
  const todayKey = getTodayDateKey();
  const todayDate = new Date();
  const [visibleYear, setVisibleYear] = useState(todayDate.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(todayDate.getMonth());
  const [summaries, setSummaries] = useState<DailyEntrySummary[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DailyQuizSubmission | null>(
    null,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summaryByDate = useMemo(
    () => new Map(summaries.map((summary) => [summary.date, summary])),
    [summaries],
  );

  const monthGrid = useMemo(
    () => buildMonthGrid(visibleYear, visibleMonth),
    [visibleYear, visibleMonth],
  );

  const loadMonth = useCallback(async () => {
    setIsLoadingMonth(true);
    setError(null);

    try {
      setSummaries(
        await getDailyEntrySummariesForMonth(visibleYear, visibleMonth),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load journal history.",
      );
    } finally {
      setIsLoadingMonth(false);
    }
  }, [visibleMonth, visibleYear]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    void loadMonth();
  }, [isExpanded, loadMonth]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleDataUpdated = () => {
      void loadMonth();
    };

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [isExpanded, loadMonth]);

  const goToPreviousMonth = () => {
    if (visibleMonth === 0) {
      setVisibleYear((current) => current - 1);
      setVisibleMonth(11);
      return;
    }

    setVisibleMonth((current) => current - 1);
  };

  const goToNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleYear((current) => current + 1);
      setVisibleMonth(0);
      return;
    }

    setVisibleMonth((current) => current + 1);
  };

  const handleDaySelect = async (dateKey: string) => {
    const summary = summaryByDate.get(dateKey);

    if (!summary) {
      return;
    }

    setSelectedDateKey(dateKey);
    setIsLoadingEntry(true);
    setError(null);

    try {
      setSelectedEntry(await getDailyEntryByDate(dateKey));
    } catch (loadError) {
      setSelectedDateKey(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load that journal entry.",
      );
    } finally {
      setIsLoadingEntry(false);
    }
  };

  const closeEntryModal = () => {
    setSelectedEntry(null);
    setSelectedDateKey(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((current) => !current)}
            >
              <CardTitle className="text-base">Journal history</CardTitle>
              <CardDescription>
                Browse past check-ins and journal entries.
              </CardDescription>
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label={isExpanded ? "Collapse journal history" : "Expand journal history"}
              onClick={() => setIsExpanded((current) => !current)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isExpanded ? (
          <CardContent className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">
                {formatMonthLabel(visibleYear, visibleMonth)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  onClick={goToPreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  onClick={goToNextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1 font-medium">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((cell) => {
              const summary = summaryByDate.get(cell.dateKey);
              const hasEntry = Boolean(summary);
              const isToday = cell.dateKey === todayKey;
              const isSelected = cell.dateKey === selectedDateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!hasEntry || isLoadingEntry}
                  aria-label={
                    hasEntry
                      ? `View journal entry for ${cell.dateKey}`
                      : undefined
                  }
                  onClick={() => void handleDaySelect(cell.dateKey)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors",
                    cell.inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/45",
                    hasEntry
                      ? "cursor-pointer hover:bg-muted/60"
                      : "cursor-default",
                    isToday && "ring-1 ring-primary/50",
                    isSelected && "bg-primary/10 ring-1 ring-primary",
                    !hasEntry && "opacity-70",
                  )}
                >
                  <span>{cell.day}</span>
                  {hasEntry ? (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                        summary?.hasJournal ? "bg-primary" : "bg-muted-foreground/50",
                      )}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Journal written
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Check-in only
            </span>
          </div>

          {isLoadingMonth ? (
            <p className="text-sm text-muted-foreground">Loading calendar...</p>
          ) : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          </CardContent>
        ) : null}
      </Card>

      <JournalEntryModal entry={selectedEntry} onClose={closeEntryModal} />
    </>
  );
}
