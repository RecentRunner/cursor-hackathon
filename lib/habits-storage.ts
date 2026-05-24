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
  streak: number;
  last_completed_on: string | null;
};

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getDayDiff(fromDate: string, toDate: string) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function shouldResetStreakForMissedDay(
  lastCompletedOn: string | null,
  today = getTodayDateKey(),
) {
  if (!lastCompletedOn) {
    return false;
  }

  return getDayDiff(lastCompletedOn, today) > 1;
}

function mapHabitRow(row: HabitRow): Habit {
  return {
    id: row.id,
    label: row.name,
    catalogId: getCatalogIdByLabel(row.name),
    streak: row.streak,
    lastCompletedDate: row.last_completed_on,
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

async function reconcileMissedDayStreaks(
  habits: HabitRow[],
  today = getTodayDateKey(),
) {
  const supabase = createClient();
  const habitsToReset = habits.filter(
    (habit) =>
      habit.streak > 0 &&
      shouldResetStreakForMissedDay(habit.last_completed_on, today),
  );

  if (habitsToReset.length === 0) {
    return habits;
  }

  await Promise.all(
    habitsToReset.map((habit) =>
      supabase.from("habits").update({ streak: 0 }).eq("id", habit.id),
    ),
  );

  return habits.map((habit) =>
    habitsToReset.some((item) => item.id === habit.id)
      ? { ...habit, streak: 0 }
      : habit,
  );
}

async function getPreviousCompletedDate(
  userId: string,
  habitId: string,
  today = getTodayDateKey(),
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habit_logs")
    .select("completed_on")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .neq("completed_on", today)
    .order("completed_on", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.completed_on ?? null;
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
    .select("id, name, streak, last_completed_on")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = await reconcileMissedDayStreaks((data ?? []) as HabitRow[]);

  return rows.map(mapHabitRow);
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
    .select("id, name, streak, last_completed_on")
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
        streak: 0,
      })
      .select("id, name, streak, last_completed_on")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    row = inserted as HabitRow;
  }

  const [reconciledRow] = await reconcileMissedDayStreaks([row]);
  return mapHabitRow(reconciledRow);
}

export async function toggleHabitCompletion(habitId: string): Promise<Habit[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const today = getTodayDateKey();

  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, name, streak, last_completed_on")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (habitError) {
    throw new Error(habitError.message);
  }

  if (!habit) {
    throw new Error("Habit not found.");
  }

  const [reconciledHabit] = await reconcileMissedDayStreaks([habit as HabitRow]);
  const currentStreak = reconciledHabit.streak;

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

    const nextStreak = Math.max(0, currentStreak - 1);
    const previousCompletedDate = await getPreviousCompletedDate(userId, habitId);

    const { error: updateError } = await supabase
      .from("habits")
      .update({
        streak: nextStreak,
        last_completed_on: previousCompletedDate,
      })
      .eq("id", habitId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(updateError.message);
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

    const nextStreak = currentStreak + 1;

    const { error: updateError } = await supabase
      .from("habits")
      .update({
        streak: nextStreak,
        last_completed_on: today,
      })
      .eq("id", habitId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(updateError.message);
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
    streak: 0,
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
