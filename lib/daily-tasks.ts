import type { DailyQuizAnswers } from "@/lib/avatar-state";
import { getDailyQuizSubmission, getTodayDateKey } from "@/lib/daily-quiz-storage";
import {
  catalogHabitIds,
  getCatalogEntry,
  habitCatalog,
  matchesFocusTopics,
  matchesQuizAnswers,
} from "@/lib/habit-catalog";
import { getHabits, saveHabits, type Habit } from "@/lib/habits-storage";
import {
  getProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profile-preferences-storage";

export type DailyTaskReason = "custom" | "focus" | "quiz";

export type DailyTask = Habit & {
  reason: DailyTaskReason;
};

function getQuizAnswersForToday(): DailyQuizAnswers | null {
  const submission = getDailyQuizSubmission();

  if (!submission || submission.date !== getTodayDateKey()) {
    return null;
  }

  return submission.answers;
}

function ensureCatalogHabit(entryId: string, habits: Habit[]) {
  const entry = getCatalogEntry(entryId);

  if (!entry) {
    return habits;
  }

  if (habits.some((habit) => habit.id === entry.id)) {
    return habits;
  }

  return [
    ...habits,
    {
      id: entry.id,
      label: entry.label,
      streak: 0,
      lastCompletedDate: null,
      isCustom: false,
    },
  ];
}

function getCatalogTaskReason(
  entry: NonNullable<ReturnType<typeof getCatalogEntry>>,
  preferences: ProfilePreferences,
  quizAnswers: DailyQuizAnswers | null,
): DailyTaskReason | null {
  const fromQuiz = quizAnswers ? matchesQuizAnswers(entry, quizAnswers) : false;
  const fromFocus = matchesFocusTopics(entry, preferences);

  if (fromQuiz) {
    return "quiz";
  }

  if (fromFocus) {
    return "focus";
  }

  return null;
}

export function getDailyTasks(): DailyTask[] {
  let habits = getHabits();
  const preferences = getProfilePreferences();
  const quizAnswers = getQuizAnswersForToday();
  const initialHabitCount = habits.length;

  const selectedCatalogIds = habitCatalog
    .map((entry) => {
      const reason = getCatalogTaskReason(entry, preferences, quizAnswers);
      return reason ? { id: entry.id, reason } : null;
    })
    .filter((item): item is { id: string; reason: DailyTaskReason } => item !== null);

  for (const { id } of selectedCatalogIds) {
    habits = ensureCatalogHabit(id, habits);
  }

  if (habits.length !== initialHabitCount) {
    saveHabits(habits, { notify: false });
  }

  const customTasks: DailyTask[] = habits
    .filter((habit) => habit.isCustom)
    .map((habit) => ({ ...habit, reason: "custom" as const }));

  const catalogTasks: DailyTask[] = selectedCatalogIds
    .map(({ id, reason }) => {
      const habit = habits.find((item) => item.id === id);
      return habit ? { ...habit, reason } : null;
    })
    .filter((task): task is DailyTask => task !== null);

  return [...customTasks, ...catalogTasks];
}

export function isCatalogHabitId(habitId: string) {
  return catalogHabitIds.has(habitId);
}
