import {
  computeAvatarCondition,
  normalizeDailyQuizAnswers,
  type AvatarCondition,
  type DailyQuizAnswers,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
const STORAGE_KEY = "habit-pet-daily-quiz";

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeSubmission(
  submission: DailyQuizSubmission,
): DailyQuizSubmission {
  const answers = normalizeDailyQuizAnswers(submission.answers);

  return {
    ...submission,
    answers,
    condition: computeAvatarCondition(answers),
  };
}

export function getDailyQuizSubmission(): DailyQuizSubmission | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return normalizeSubmission(JSON.parse(raw) as DailyQuizSubmission);
  } catch {
    return null;
  }
}

export function hasCompletedDailyQuizToday() {
  const submission = getDailyQuizSubmission();
  return submission?.date === getTodayDateKey();
}

export function saveDailyQuizSubmission(
  answers: DailyQuizAnswers,
): DailyQuizSubmission {
  const submission: DailyQuizSubmission = {
    date: getTodayDateKey(),
    answers,
    condition: computeAvatarCondition(answers),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submission));

  notifyHabitPetDataUpdated();

  return submission;
}

export function getAvatarConditionForToday(): AvatarCondition | null {
  const submission = getDailyQuizSubmission();

  if (!submission || submission.date !== getTodayDateKey()) {
    return null;
  }

  return submission.condition;
}
