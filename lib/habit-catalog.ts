import type { DailyQuizAnswers } from "@/lib/avatar-state";
import type { ProfilePreferences } from "@/lib/profile-preferences-storage";

export type HabitCatalogEntry = {
  id: string;
  label: string;
  focusTopics: string[];
  suggestedByQuiz: (answers: DailyQuizAnswers) => boolean;
};

export const habitCatalog: HabitCatalogEntry[] = [
  {
    id: "walk",
    label: "Went for a walk",
    focusTopics: ["Movement"],
    suggestedByQuiz: (answers) => answers.energy <= 2 || answers.feeling <= 2,
  },
  {
    id: "water",
    label: "Drank enough water",
    focusTopics: ["Hydration"],
    suggestedByQuiz: (answers) => answers.energy <= 3,
  },
  {
    id: "meal",
    label: "Ate a proper meal",
    focusTopics: ["Hydration"],
    suggestedByQuiz: (answers) => answers.feeling <= 2,
  },
  {
    id: "study",
    label: "Studied",
    focusTopics: ["Mindfulness"],
    suggestedByQuiz: () => false,
  },
  {
    id: "clean",
    label: "Cleaned room",
    focusTopics: ["Mindfulness"],
    suggestedByQuiz: (answers) => answers.stress >= 4,
  },
  {
    id: "screen-break",
    label: "Took a screen break",
    focusTopics: ["Mindfulness", "Movement"],
    suggestedByQuiz: (answers) => answers.stress >= 4 || answers.energy <= 2,
  },
  {
    id: "wind-down",
    label: "Wind down before bed",
    focusTopics: ["Sleep"],
    suggestedByQuiz: (answers) =>
      answers.sleepLength < 7 || answers.sleepQuality <= 2,
  },
];

export const catalogHabitIds = new Set(habitCatalog.map((habit) => habit.id));

export function getCatalogEntry(habitId: string) {
  return habitCatalog.find((habit) => habit.id === habitId);
}

export function getCatalogIdByLabel(label: string) {
  return habitCatalog.find((habit) => habit.label === label)?.id ?? null;
}

export function isCatalogLabel(label: string) {
  return habitCatalog.some((habit) => habit.label === label);
}

export function matchesFocusTopics(
  entry: HabitCatalogEntry,
  preferences: ProfilePreferences,
) {
  return entry.focusTopics.some((topic) =>
    preferences.focusTopics.includes(topic),
  );
}

export function matchesQuizAnswers(
  entry: HabitCatalogEntry,
  answers: DailyQuizAnswers,
) {
  return entry.suggestedByQuiz(answers);
}
