import {
  catalogHabitIds,
  getCatalogEntry,
  getCatalogIdByLabel,
  isCatalogLabel,
} from "@/lib/habit-catalog";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import { createClient } from "@/lib/supabase/client";

export type Habit = {
  id: string;
  label: string;
  catalogId: string | null;
  streak: number;
  lastCompletedDate: string | null;
  isCustom: boolean;
};

type HabitRow = {
  id: string;
  name: string;
};

type HabitLogRow = {
  habit_id: string;
  completed_on: string;
};

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function calculateStreak(completedDates: string[], today = getTodayDateKey()) {
  if (completedDates.length === 0) {
    return 0;
  }

  const dates = new Set(completedDates);
  let streak = 0;
  const cursor = new Date(`${today}T00:00:00`);

  if (!dates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (dates.has(getTodayDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLastCompletedDate(completedDates: string[], today = getTodayDateKey()) {
  if (completedDates.includes(today)) {
    return today;
  }

  const sortedDates = [...completedDates].sort().reverse();
  return sortedDates[0] ?? null;
}

function mapHabitRow(
  row: HabitRow,
  logsByHabitId: Map<string, string[]>,
  today = getTodayDateKey(),
): Habit {
  const completedDates = logsByHabitId.get(row.id) ?? [];

  return {
    id: row.id,
    label: row.name,
    catalogId: getCatalogIdByLabel(row.name),
    streak: calculateStreak(completedDates, today),
    lastCompletedDate: getLastCompletedDate(completedDates, today),
    isCustom: !isCatalogLabel(row.name),
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

async function fetchHabitLogs(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("habit_id, completed_on")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  const logsByHabitId = new Map<string, string[]>();

  for (const log of (data ?? []) as HabitLogRow[]) {
    const existing = logsByHabitId.get(log.habit_id) ?? [];
    existing.push(log.completed_on);
    logsByHabitId.set(log.habit_id, existing);
  }

  return logsByHabitId;
}

export function isHabitCompletedToday(habit: Habit, today = getTodayDateKey()) {
  return habit.lastCompletedDate === today;
}

export async function getHabits(): Promise<Habit[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id, name")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const logsByHabitId = await fetchHabitLogs(userId);

  return ((data ?? []) as HabitRow[]).map((row) =>
    mapHabitRow(row, logsByHabitId),
  );
}

export async function ensureCatalogHabit(catalogId: string): Promise<Habit | null> {
  const entry = getCatalogEntry(catalogId);

  if (!entry) {
    return null;
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return null;
  }

  const supabase = createClient();
  const { data: existing, error: existingError } = await supabase
    .from("habits")
    .select("id, name")
    .eq("user_id", userId)
    .eq("name", entry.label)
    .eq("active", true)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  let row = existing as HabitRow | null;

  if (!row) {
    const { data: inserted, error: insertError } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: entry.label,
        active: true,
      })
      .select("id, name")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    row = inserted as HabitRow;
  }

  const logsByHabitId = await fetchHabitLogs(userId);
  return mapHabitRow(row, logsByHabitId);
}

export async function toggleHabitCompletion(habitId: string): Promise<Habit[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const today = getTodayDateKey();
  const { data: existingLog, error: existingLogError } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .eq("completed_on", today)
    .maybeSingle();

  if (existingLogError) {
    throw new Error(existingLogError.message);
  }

  if (existingLog) {
    const { error: deleteError } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existingLog.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("habit_logs").insert({
      user_id: userId,
      habit_id: habitId,
      completed_on: today,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  notifyHabitPetDataUpdated();
  return getHabits();
}

export async function addHabit(label: string): Promise<Habit[]> {
  const trimmedLabel = label.trim();

  if (!trimmedLabel) {
    return getHabits();
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const { error } = await supabase.from("habits").insert({
    user_id: userId,
    name: trimmedLabel,
    active: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  notifyHabitPetDataUpdated();
  return getHabits();
}

export async function removeHabit(habitId: string): Promise<Habit[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, name")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (habitError) {
    throw new Error(habitError.message);
  }

  if (!habit || isCatalogLabel(habit.name)) {
    return getHabits();
  }

  const { error: deleteError } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  notifyHabitPetDataUpdated();
  return getHabits();
}

export async function getCustomHabits() {
  const habits = await getHabits();
  return habits.filter((habit) => habit.isCustom);
}

export function isCatalogHabitId(habitId: string) {
  return catalogHabitIds.has(habitId);
}
