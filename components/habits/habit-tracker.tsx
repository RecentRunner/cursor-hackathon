"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getDailyTasks,
  type DailyTask,
} from "@/lib/daily-tasks";
import {
  addHabit,
  getCustomHabits,
  isHabitCompletedToday,
  removeHabit,
  toggleHabitCompletion,
  type Habit,
} from "@/lib/habits-storage";
import { getProfilePreferences } from "@/lib/profile-preferences-storage";
import { hasCompletedDailyQuizToday } from "@/lib/daily-quiz-storage";

type HabitTrackerProps = {
  mode?: "daily" | "manage";
};

const reasonLabels = {
  custom: "Custom",
  focus: "Your focus",
  quiz: "Today's quiz",
} as const;

function DailyTaskList({
  tasks,
  getIsCompleted,
  isPending,
  getToggleError,
  onToggle,
}: {
  tasks: DailyTask[];
  getIsCompleted: (habit: DailyTask) => boolean;
  isPending: (habitId: string) => boolean;
  getToggleError: (habitId: string) => string | null;
  onToggle: (habitId: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No daily tasks yet. Set focus topics in Profile or complete the daily
        quiz to personalize your list.
      </p>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const aCompleted = getIsCompleted(a);
    const bCompleted = getIsCompleted(b);

    if (aCompleted === bCompleted) {
      return 0;
    }

    return aCompleted ? 1 : -1;
  });

  return (
    <>
      {sortedTasks.map((habit) => {
        const isCompleted = getIsCompleted(habit);
        const pending = isPending(habit.id);
        const toggleError = getToggleError(habit.id);

        return (
          <div
            key={habit.id}
            className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${
              isCompleted ? "bg-muted/40 opacity-80" : ""
            }`}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex items-center gap-2">
                <Checkbox
                  id={habit.id}
                  checked={isCompleted}
                  disabled={pending}
                  onCheckedChange={() => onToggle(habit.id)}
                />
                {pending ? (
                  <>
                    <Loader2
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin text-muted-foreground"
                    />
                    <span className="sr-only">Saving habit completion</span>
                  </>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor={habit.id} className="leading-snug">
                  {habit.label}
                </Label>
                <Badge
                  variant="outline"
                  className="w-fit px-2.5 py-0.5 text-[11px] font-normal"
                >
                  {reasonLabels[habit.reason]}
                </Badge>
                {toggleError ? (
                  <p className="text-xs text-red-500">{toggleError}</p>
                ) : null}
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {habit.streak} day streak
            </Badge>
          </div>
        );
      })}
    </>
  );
}

function CustomHabitList({
  habits,
  onRemove,
}: {
  habits: Habit[];
  onRemove: (habitId: string) => void;
}) {
  if (habits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No custom habits yet. Add one below to include it in your daily tasks.
      </p>
    );
  }

  return (
    <>
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <span className="text-sm">{habit.label}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{habit.streak} day streak</Badge>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onRemove(habit.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </>
  );
}

export function HabitTracker({ mode = "daily" }: HabitTrackerProps) {
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [customHabits, setCustomHabits] = useState<Habit[]>([]);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [quizCompletedToday, setQuizCompletedToday] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticCompletion, setOptimisticCompletion] = useState<
    Record<string, boolean>
  >({});
  const [pendingHabitIds, setPendingHabitIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({});

  const getIsCompleted = useCallback(
    (habit: DailyTask) => {
      if (habit.id in optimisticCompletion) {
        return optimisticCompletion[habit.id];
      }

      return isHabitCompletedToday(habit);
    },
    [optimisticCompletion],
  );

  const isPending = useCallback(
    (habitId: string) => pendingHabitIds.has(habitId),
    [pendingHabitIds],
  );

  const getToggleError = useCallback(
    (habitId: string) => toggleErrors[habitId] ?? null,
    [toggleErrors],
  );

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [tasks, customs] = await Promise.all([
        getDailyTasks(),
        getCustomHabits(),
      ]);
      setDailyTasks(tasks);
      setCustomHabits(customs);
      setFocusTopics(getProfilePreferences().focusTopics);
      setQuizCompletedToday(await hasCompletedDailyQuizToday());
      setIsReady(true);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load habits.",
      );
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  const handleToggle = (habitId: string) => {
    const habit = dailyTasks.find((task) => task.id === habitId);

    if (!habit || pendingHabitIds.has(habitId)) {
      return;
    }

    const nextCompleted = !getIsCompleted(habit);

    setOptimisticCompletion((current) => ({
      ...current,
      [habitId]: nextCompleted,
    }));
    setPendingHabitIds((current) => new Set(current).add(habitId));
    setToggleErrors((current) => {
      const next = { ...current };
      delete next[habitId];
      return next;
    });

    void (async () => {
      try {
        const updatedHabits = await toggleHabitCompletion(habitId);

        setDailyTasks((current) =>
          current.map((task) => {
            const updated = updatedHabits.find((item) => item.id === task.id);
            return updated ? { ...task, ...updated } : task;
          }),
        );
        setOptimisticCompletion((current) => {
          const next = { ...current };
          delete next[habitId];
          return next;
        });
      } catch (toggleError) {
        setOptimisticCompletion((current) => {
          const next = { ...current };
          delete next[habitId];
          return next;
        });
        setToggleErrors((current) => ({
          ...current,
          [habitId]:
            toggleError instanceof Error
              ? toggleError.message
              : "Could not update habit.",
        }));
      } finally {
        setPendingHabitIds((current) => {
          const next = new Set(current);
          next.delete(habitId);
          return next;
        });
      }
    })();
  };

  const handleAddHabit = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await addHabit(newHabitLabel);
      setNewHabitLabel("");
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Could not add habit.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveHabit = async (habitId: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await removeHabit(habitId);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove habit.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Loading habits...</p>
        </CardContent>
      </Card>
    );
  }

  if (mode === "manage") {
    return (
      <div className="flex flex-col gap-6">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Custom habits</CardTitle>
            <CardDescription>
              Add your own habits. Custom habits always appear in your daily
              task list.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomHabitList habits={customHabits} onRemove={handleRemoveHabit} />
            <div className="flex gap-2">
              <Input
                value={newHabitLabel}
                placeholder="Add a custom habit"
                disabled={isSaving}
                onChange={(event) => setNewHabitLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleAddHabit();
                  }
                }}
              />
              <Button
                type="button"
                disabled={isSaving || newHabitLabel.trim().length === 0}
                onClick={() => void handleAddHabit()}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How daily tasks are picked</CardTitle>
            <CardDescription>
              Your tasks combine focus preferences, custom habits, and today&apos;s
              quiz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Focus topics:{" "}
              {focusTopics.length > 0 ? focusTopics.join(", ") : "None selected"}
            </p>
            <p>
              Daily quiz today:{" "}
              {quizCompletedToday ? "Completed" : "Not completed yet"}
            </p>
            <p>
              Suggested habits can appear when your quiz shows low energy, high
              stress, or poor sleep.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s tasks</CardTitle>
        <CardDescription>
          Personalized from your focus topics
          {quizCompletedToday ? ", today's quiz," : ""} and custom habits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <DailyTaskList
          tasks={dailyTasks}
          getIsCompleted={getIsCompleted}
          isPending={isPending}
          getToggleError={getToggleError}
          onToggle={handleToggle}
        />
      </CardContent>
    </Card>
  );
}
