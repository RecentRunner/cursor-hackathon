import { ensureAiDailyTasks } from "@/lib/ai-daily-tasks";
import { getHabits, type Habit } from "@/lib/habits-storage";

export type DailyTaskReason = "custom" | "suggested";

export type DailyTask = Habit & {
  reason: DailyTaskReason;
};

export async function getDailyTasks(): Promise<DailyTask[]> {
  await ensureAiDailyTasks();

  const habits = await getHabits();

  const customTasks: DailyTask[] = habits
    .filter((habit) => habit.isCustom)
    .map((habit) => ({ ...habit, reason: "custom" as const }));

  const suggestedTasks: DailyTask[] = habits
    .filter((habit) => habit.isAiGenerated)
    .map((habit) => ({ ...habit, reason: "suggested" as const }));

  return [...customTasks, ...suggestedTasks];
}

export { isCatalogHabitId } from "@/lib/habits-storage";
