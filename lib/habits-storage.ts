import {
  catalogHabitIds,
  getCatalogEntry,
  getCatalogIdByLabel,
  isCatalogLabel,
} from "@/lib/habit-catalog";
import {
  displayHabitName,
  isAiGeneratedHabitName,
} from "@/lib/ai-habit-utils";
import { adjustCoins } from "@/lib/avatar-progression-storage";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";
import {
  COINS_PER_TASK_COMPLETE,
  COINS_PER_TASK_UNCHECK,
  getStreakMilestoneBonus,
} from "@/lib/coins";
import { createClient } from "@/lib/supabase/client";

export type Habit = {
  id: string;
  label: string;
  catalogId: string | null;
  streak: number;
  lastCompletedDate: string | null;
  isCustom: boolean;
  isAiGenerated: boolean;
};

export type ToggleHabitResult = {
  habits: Habit[];
  coinsDelta: number;
};

type HabitRow = {
  id: string;
  name: string;
  streak: number;
  last_completed_on: string | null;
  claimed_streak_milestones?: number[];
};

const habitSelectFields =
  "id, name, streak, last_completed_on, claimed_streak_milestones";

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
  const displayName = displayHabitName(row.name);
  const isAiGenerated = isAiGeneratedHabitName(row.name);

  return {
    id: row.id,
    label: displayName,
    catalogId: isAiGenerated ? null : getCatalogIdByLabel(displayName),
    streak: row.streak ?? 0,
    lastCompletedDate: row.last_completed_on ?? null,
    isCustom: !isAiGenerated && !isCatalogLabel(displayName),
    isAiGenerated,
  };
}

function getFirstRow<T>(rows: T[] | null | undefined) {
  return rows?.[0] ?? null;
}

function dedupeHabitsByName(rows: HabitRow[]) {
  const seen = new Map<string, HabitRow>();

  for (const row of rows) {
    const key = row.name.trim().toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, row);
    }
  }

  return Array.from(seen.values());
}

async function findActiveHabitByName(
  userId: string,
  name: string,
): Promise<HabitRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("habits")
    .select(habitSelectFields)
    .eq("user_id", userId)
    .eq("name", name)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return getFirstRow(data as HabitRow[] | null);
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
      supabase
        .from("habits")
        .update({ streak: 0, claimed_streak_milestones: [] })
        .eq("id", habit.id),
    ),
  );

  return habits.map((habit) =>
    habitsToReset.some((item) => item.id === habit.id)
      ? { ...habit, streak: 0, claimed_streak_milestones: [] }
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
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  return getFirstRow(data as { completed_on: string }[] | null)?.completed_on ?? null;
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
    .select(habitSelectFields)
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = await reconcileMissedDayStreaks(
    dedupeHabitsByName((data ?? []) as HabitRow[]),
  );

  return rows.map(mapHabitRow);
}

export async function getCompletedHabitLabelsForToday(): Promise<string[]> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClient();
  const today = getTodayDateKey();

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("habit_id")
    .eq("user_id", userId)
    .eq("completed_on", today);

  if (logsError) {
    throw new Error(logsError.message);
  }

  const habitIds = (logs ?? []).map((log) => log.habit_id as string);

  if (habitIds.length === 0) {
    return [];
  }

  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("name")
    .eq("user_id", userId)
    .in("id", habitIds);

  if (habitsError) {
    throw new Error(habitsError.message);
  }

  return (habits ?? []).map((habit) =>
    displayHabitName((habit as { name: string }).name),
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
  let row = await findActiveHabitByName(userId, entry.label);

  if (!row) {
    const { data: inserted, error: insertError } = await supabase
      .from("habits")
      .insert({
        user_id: userId,
        name: entry.label,
        active: true,
        streak: 0,
      })
      .select(habitSelectFields)
      .single();

    if (insertError) {
      row = await findActiveHabitByName(userId, entry.label);

      if (!row) {
        throw new Error(insertError.message);
      }
    } else {
      row = inserted as HabitRow;
    }
  }

  const [reconciledRow] = await reconcileMissedDayStreaks([row]);
  return mapHabitRow(reconciledRow);
}

export async function toggleHabitCompletion(
  habitId: string,
): Promise<ToggleHabitResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return { habits: [], coinsDelta: 0 };
  }

  const supabase = createClient();
  const today = getTodayDateKey();

  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select(habitSelectFields)
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

  const { data: existingLogs, error: existingLogError } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .eq("completed_on", today);

  if (existingLogError) {
    throw new Error(existingLogError.message);
  }

  const existingLog = getFirstRow(existingLogs as { id: string }[] | null);
  let coinsDelta = 0;

  if (existingLog) {
    const { error: deleteError } = await supabase
      .from("habit_logs")
      .delete()
      .eq("user_id", userId)
      .eq("habit_id", habitId)
      .eq("completed_on", today);

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

    coinsDelta = COINS_PER_TASK_UNCHECK;
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
    const claimedMilestones = reconciledHabit.claimed_streak_milestones ?? [];
    const milestoneBonus = getStreakMilestoneBonus(nextStreak);
    const earnedMilestoneBonus =
      milestoneBonus !== null && !claimedMilestones.includes(nextStreak);
    const nextClaimedMilestones = earnedMilestoneBonus
      ? [...claimedMilestones, nextStreak]
      : claimedMilestones;

    const { error: updateError } = await supabase
      .from("habits")
      .update({
        streak: nextStreak,
        last_completed_on: today,
        claimed_streak_milestones: nextClaimedMilestones,
      })
      .eq("id", habitId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    coinsDelta =
      COINS_PER_TASK_COMPLETE + (earnedMilestoneBonus ? milestoneBonus : 0);
  }

  await adjustCoins(coinsDelta);

  notifyHabitPetDataUpdated();
  return { habits: await getHabits(), coinsDelta };
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

  if (!habit || isCatalogLabel(habit.name) || isAiGeneratedHabitName(habit.name)) {
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
