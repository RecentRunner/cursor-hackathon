import type { DailyQuizAnswers } from "@/lib/avatar-state";
import type { ProfilePreferences } from "@/lib/profile-preferences-storage";
import { getTodayDateKey } from "@/lib/daily-quiz-storage";

export type OnboardingAnswers = {
  focusTopic: string | null;
  avatarVibe: string | null;
};

export type AiTaskContext = {
  date: string;
  preferences: ProfilePreferences;
  onboarding: OnboardingAnswers;
  dailyQuiz: DailyQuizAnswers | null;
  journal: string | null;
};

export function buildAiTaskContext(input: {
  preferences: ProfilePreferences;
  onboarding: OnboardingAnswers;
  dailyQuiz: DailyQuizAnswers | null;
  journal: string | null;
  date?: string;
}): AiTaskContext {
  return {
    date: input.date ?? getTodayDateKey(),
    preferences: input.preferences,
    onboarding: input.onboarding,
    dailyQuiz: input.dailyQuiz,
    journal: input.journal,
  };
}

export function buildAiTaskInputHash(context: AiTaskContext) {
  return JSON.stringify({
    date: context.date,
    preferences: context.preferences,
    onboarding: context.onboarding,
    dailyQuiz: context.dailyQuiz,
    journal: context.journal?.trim() ?? "",
  });
}

export function formatAiTaskContextForPrompt(context: AiTaskContext) {
  const { preferences, onboarding, dailyQuiz, journal } = context;

  const quizSection = dailyQuiz
    ? [
        `Mood: ${dailyQuiz.feeling}/5`,
        `Stress: ${dailyQuiz.stress}/5`,
        `Energy: ${dailyQuiz.energy}/5`,
        `Sleep: ${dailyQuiz.sleepLength} hours`,
        `Sleep quality: ${dailyQuiz.sleepQuality}/5`,
      ].join("\n")
    : "No daily wellness check-in completed yet today.";

  const journalSection = journal?.trim()
    ? journal.trim()
    : "No journal entry for today.";

  const stressNote =
    dailyQuiz && dailyQuiz.stress >= 4
      ? "Stress is elevated today — include calming or light cardio tasks."
      : null;

  const journalNote = journal?.trim()
    ? "The journal entry is especially important. If the user mentions wanting to do something specific (like swimming), include a matching check-off task."
    : null;

  return [
    "Profile preferences:",
    `- Focus topic: ${preferences.focusTopic}`,
    `- Avatar vibe: ${preferences.avatarVibe}`,
    `- Daily reminder enabled: ${preferences.dailyReminderEnabled ? "yes" : "no"}`,
    `- Daily reminder time: ${preferences.dailyReminderTime}`,
    "",
    "Onboarding quiz answers:",
    `- Primary focus: ${onboarding.focusTopic ?? "unknown"}`,
    `- Starter pet vibe: ${onboarding.avatarVibe ?? "unknown"}`,
    "",
    "Today's wellness check-in:",
    quizSection,
    stressNote ?? "",
    "",
    "Today's journal (high priority):",
    journalSection,
    journalNote ?? "",
  ]
    .filter(Boolean)
    .join("\n");
}
