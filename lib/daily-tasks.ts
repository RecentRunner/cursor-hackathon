import type { DailyQuizAnswers } from "@/lib/avatar-state";
import { getDailyEntryForToday } from "@/lib/daily-quiz-storage";
import {
  getCatalogEntry,
  habitCatalog,
  matchesFocusTopics,
  matchesQuizAnswers,
} from "@/lib/habit-catalog";
import {
  ensureCatalogHabit,
  getHabits,
  type Habit,
} from "@/lib/habits-storage";
import {
  getProfilePreferences,
  type ProfilePreferences,
} from "@/lib/profile-preferences-storage";

export type DailyTaskReason = "custom" | "focus" | "quiz";

export type DailyTask = Habit & {
  reason: DailyTaskReason;
};

async function getQuizAnswersForToday(): Promise<DailyQuizAnswers | null> {
  const entry = await getDailyEntryForToday();
  return entry?.answers ?? null;
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

export async function getDailyTasks(): Promise<DailyTask[]> {
  const preferences = await getProfilePreferences();
  const quizAnswers = await getQuizAnswersForToday();

  const selectedCatalogIds = habitCatalog
    .map((entry) => {
      const reason = getCatalogTaskReason(entry, preferences, quizAnswers);
      return reason ? { catalogId: entry.id, reason } : null;
    })
    .filter(
      (item): item is { catalogId: string; reason: DailyTaskReason } =>
        item !== null,
    );

  await Promise.all(
    selectedCatalogIds.map(({ catalogId }) => ensureCatalogHabit(catalogId)),
  );

  const habits = await getHabits();

  const customTasks: DailyTask[] = habits
    .filter((habit) => habit.isCustom)
    .map((habit) => ({ ...habit, reason: "custom" as const }));

  const catalogTasks: DailyTask[] = selectedCatalogIds
    .map(({ catalogId, reason }) => {
      const habit = habits.find((item) => item.catalogId === catalogId);
      return habit ? { ...habit, reason } : null;
    })
    .filter((task): task is DailyTask => task !== null);

  return [...customTasks, ...catalogTasks];
}

export { isCatalogHabitId } from "@/lib/habits-storage";
