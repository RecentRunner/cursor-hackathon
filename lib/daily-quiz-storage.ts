import {
  computeAvatarCondition,
  normalizeDailyQuizAnswers,
  type AvatarCondition,
  type DailyQuizAnswers,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
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

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function mapRowToSubmission(row: DailyEntryRow): DailyQuizSubmission {
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
    condition: computeAvatarCondition(answers),
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

  return mapRowToSubmission(row as DailyEntryRow);
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

  const submission = mapRowToSubmission(data as DailyEntryRow);
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
  const entry = await getDailyEntryForToday();
  return entry?.condition ?? null;
}
