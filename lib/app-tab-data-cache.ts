import type { AvatarCondition, DailyQuizSubmission } from "@/lib/avatar-state";
import type { DailyTask } from "@/lib/daily-tasks";
import { getDailyTasks } from "@/lib/daily-tasks";
import {
  getAvatarConditionForToday,
  getDailyEntryForToday,
  hasCompletedDailyQuizToday,
} from "@/lib/daily-quiz-storage";
import { getCustomHabits, type Habit } from "@/lib/habits-storage";
import { getProfilePreferences } from "@/lib/profile-preferences-storage";

export type QuizTabData = {
  submission: DailyQuizSubmission | null;
  liveCondition: AvatarCondition | null;
};

export type HabitsTabData = {
  dailyTasks: DailyTask[];
  customHabits: Habit[];
  focusTopic: string | null;
  quizCompletedToday: boolean;
};

let quizCache: QuizTabData | null = null;
let habitsCache: HabitsTabData | null = null;
let quizInflight: Promise<QuizTabData> | null = null;
let habitsInflight: Promise<HabitsTabData> | null = null;

export function getCachedQuizTabData() {
  return quizCache;
}

export function getCachedHabitsTabData() {
  return habitsCache;
}

export function invalidateAppTabDataCache() {
  quizCache = null;
  habitsCache = null;
}

async function loadQuizTabData(): Promise<QuizTabData> {
  const submission = await getDailyEntryForToday();

  if (submission) {
    return {
      submission,
      liveCondition: submission.condition,
    };
  }

  return {
    submission: null,
    liveCondition: await getAvatarConditionForToday(),
  };
}

async function loadHabitsTabData(): Promise<HabitsTabData> {
  const [dailyTasks, customHabits, preferences, quizCompletedToday] =
    await Promise.all([
      getDailyTasks(),
      getCustomHabits(),
      getProfilePreferences(),
      hasCompletedDailyQuizToday(),
    ]);

  return {
    dailyTasks,
    customHabits,
    focusTopic: preferences.focusTopic,
    quizCompletedToday,
  };
}

export async function prefetchQuizTabData(options?: { force?: boolean }) {
  if (!options?.force && quizCache) {
    return quizCache;
  }

  if (quizInflight) {
    return quizInflight;
  }

  quizInflight = loadQuizTabData()
    .then((data) => {
      quizCache = data;
      return data;
    })
    .finally(() => {
      quizInflight = null;
    });

  return quizInflight;
}

export async function prefetchHabitsTabData(options?: { force?: boolean }) {
  if (!options?.force && habitsCache) {
    return habitsCache;
  }

  if (habitsInflight) {
    return habitsInflight;
  }

  habitsInflight = loadHabitsTabData()
    .then((data) => {
      habitsCache = data;
      return data;
    })
    .finally(() => {
      habitsInflight = null;
    });

  return habitsInflight;
}

export async function prefetchAppTabData(options?: { force?: boolean }) {
  await Promise.all([
    prefetchQuizTabData(options),
    prefetchHabitsTabData(options),
  ]);
}
