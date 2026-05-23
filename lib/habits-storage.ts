import { catalogHabitIds, habitCatalog } from "@/lib/habit-catalog";
import { notifyHabitPetDataUpdated } from "@/lib/app-events";

export type Habit = {
  id: string;
  label: string;
  streak: number;
  lastCompletedDate: string | null;
  isCustom: boolean;
};

const STORAGE_KEY = "habit-pet-habits";

export const defaultHabits: Habit[] = habitCatalog.map((entry) => ({
  id: entry.id,
  label: entry.label,
  streak: 0,
  lastCompletedDate: null,
  isCustom: false,
}));

export function getTodayDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayDateKey(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getTodayDateKey(yesterday);
}

function normalizeHabit(habit: Partial<Habit> & { id: string; label: string }): Habit {
  return {
    id: habit.id,
    label: habit.label,
    streak: habit.streak ?? 0,
    lastCompletedDate: habit.lastCompletedDate ?? null,
    isCustom: habit.isCustom ?? !catalogHabitIds.has(habit.id),
  };
}

export function isHabitCompletedToday(habit: Habit, today = getTodayDateKey()) {
  return habit.lastCompletedDate === today;
}

export function getHabits(): Habit[] {
  if (typeof window === "undefined") {
    return defaultHabits;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultHabits;
  }

  try {
    const habits = (JSON.parse(raw) as Habit[]).map(normalizeHabit);
    return habits.length > 0 ? habits : defaultHabits;
  } catch {
    return defaultHabits;
  }
}

export function saveHabits(habits: Habit[], options?: { notify?: boolean }) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));

  if (options?.notify !== false) {
    notifyHabitPetDataUpdated();
  }
}

export function toggleHabitCompletion(habitId: string): Habit[] {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const habits = getHabits().map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    if (isHabitCompletedToday(habit, today)) {
      return {
        ...habit,
        lastCompletedDate: null,
        streak: Math.max(0, habit.streak - 1),
      };
    }

    const nextStreak =
      habit.lastCompletedDate === yesterday ? habit.streak + 1 : 1;

    return {
      ...habit,
      lastCompletedDate: today,
      streak: nextStreak,
    };
  });

  saveHabits(habits);
  return habits;
}

export function addHabit(label: string): Habit[] {
  const trimmedLabel = label.trim();

  if (!trimmedLabel) {
    return getHabits();
  }

  const habits = [
    ...getHabits(),
    normalizeHabit({
      id: crypto.randomUUID(),
      label: trimmedLabel,
      streak: 0,
      lastCompletedDate: null,
      isCustom: true,
    }),
  ];

  saveHabits(habits);
  return habits;
}

export function removeHabit(habitId: string): Habit[] {
  const habits = getHabits().filter(
    (habit) => habit.id !== habitId || !habit.isCustom,
  );
  saveHabits(habits);
  return habits;
}

export function getCustomHabits() {
  return getHabits().filter((habit) => habit.isCustom);
}
