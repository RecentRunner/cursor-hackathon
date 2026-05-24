import {
  normalizeDailyQuizAnswers,
  type AvatarCondition,
  type DailyQuizAnswers,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import {
  formatCountdownDuration,
  getMillisecondsUntilLocalMidnight,
  getNextLocalMidnight,
  getTodayDateKey,
} from "@/lib/date-keys";
import { computeAvatarConditionWithHabitBoosts } from "@/lib/habit-wellness-effects";
import { getCompletedHabitLabelsForToday } from "@/lib/habits-storage";
import { validateJournalEntry } from "@/lib/journal-safety";
import { createClient } from "@/lib/supabase/client";

type DailyEntryRow = {
  entry_date: string;
  mood: number;
  stress: number;
  energy: number;
  sleep_hours: number;
  sleep_quality: number;
  journal: string | null;
};

export { getTodayDateKey };

export function getNextDailyQuizAvailableAt(from = new Date()) {
  return getNextLocalMidnight(from);
}

export function getMillisecondsUntilNextDailyQuiz(from = new Date()) {
  return getMillisecondsUntilLocalMidnight(from);
}

export function formatDailyQuizCountdown(milliseconds: number) {
  return formatCountdownDuration(milliseconds);
}

export async function resetTodaysDailyQuiz() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to reset today's quiz.");
  }

  const supabase = createClient();
  const entryDate = getTodayDateKey();
  const { error } = await supabase
    .from("daily_entries")
    .delete()
    .eq("user_id", userId)
    .eq("entry_date", entryDate);

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
}

function mapRowToSubmission(
  row: DailyEntryRow,
  completedHabitLabels: string[] = [],
): DailyQuizSubmission {
  const answers = normalizeDailyQuizAnswers({
    feeling: row.mood,
    stress: row.stress,
    energy: row.energy,
    sleepLength: Number(row.sleep_hours),
    sleepQuality: row.sleep_quality,
  });

  return {
    date: row.entry_date,
    answers,
    journal: row.journal ?? "",
    condition: computeAvatarConditionWithHabitBoosts(answers, completedHabitLabels),
  };
}

async function getAuthenticatedUserId() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

export async function getDailyEntryForToday(): Promise<DailyQuizSubmission | null> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return null;
  }

  const supabase = createClient();
  const entryDate = getTodayDateKey();
  const { data, error } = await supabase
    .from("daily_entries")
    .select(
      "entry_date, mood, stress, energy, sleep_hours, sleep_quality, journal",
    )
    .eq("user_id", userId)
    .eq("entry_date", entryDate)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  const row = data?.[0];

  if (!row) {
    return null;
  }

  const completedHabitLabels = await getCompletedHabitLabelsForToday();

  return mapRowToSubmission(row as DailyEntryRow, completedHabitLabels);
}

export async function getDailyQuizSubmission() {
  return getDailyEntryForToday();
}

export async function hasCompletedDailyQuizToday() {
  const entry = await getDailyEntryForToday();
  return entry !== null;
}

export async function saveDailyEntry(
  answers: DailyQuizAnswers,
  journal: string,
): Promise<DailyQuizSubmission> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to save your daily check-in.");
  }

  const supabase = createClient();
  const entryDate = getTodayDateKey();
  const normalizedAnswers = normalizeDailyQuizAnswers(answers);
  const sanitizedJournal = validateJournalEntry(journal);

  const { data, error } = await supabase
    .from("daily_entries")
    .upsert(
      {
        user_id: userId,
        entry_date: entryDate,
        mood: normalizedAnswers.feeling,
        stress: normalizedAnswers.stress,
        energy: normalizedAnswers.energy,
        sleep_hours: normalizedAnswers.sleepLength,
        sleep_quality: normalizedAnswers.sleepQuality,
        journal: sanitizedJournal,
      },
      { onConflict: "user_id,entry_date" },
    )
    .select(
      "entry_date, mood, stress, energy, sleep_hours, sleep_quality, journal",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const submission = mapRowToSubmission(
    data as DailyEntryRow,
    await getCompletedHabitLabelsForToday(),
  );
  notifyHabitPetDataUpdated();
  return submission;
}

export async function saveDailyQuizSubmission(
  answers: DailyQuizAnswers,
  journal = "",
) {
  return saveDailyEntry(answers, journal);
}

export async function getAvatarConditionForToday(): Promise<AvatarCondition | null> {
  const [entry, completedHabitLabels] = await Promise.all([
    getDailyEntryForToday(),
    getCompletedHabitLabelsForToday(),
  ]);

  if (!entry && completedHabitLabels.length === 0) {
    return null;
  }

  return computeAvatarConditionWithHabitBoosts(
    entry?.answers,
    completedHabitLabels,
  );
}
