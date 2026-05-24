import { hasCompletedDailyQuizToday } from "@/lib/daily-quiz-storage";
import { getDailyTasks } from "@/lib/daily-tasks";
import { getTodayDateKey, isHabitCompletedToday } from "@/lib/habits-storage";

export type DailyReminderStatus = {
  dateKey: string;
  quizCompleted: boolean;
  totalTasks: number;
  incompleteTaskCount: number;
  needsReminder: boolean;
};

export async function getDailyReminderStatus(): Promise<DailyReminderStatus> {
  const dateKey = getTodayDateKey();
  const [quizCompleted, tasks] = await Promise.all([
    hasCompletedDailyQuizToday(),
    getDailyTasks(),
  ]);

  const incompleteTaskCount = tasks.filter(
    (task) => !isHabitCompletedToday(task, dateKey),
  ).length;

  return {
    dateKey,
    quizCompleted,
    totalTasks: tasks.length,
    incompleteTaskCount,
    needsReminder: !quizCompleted || incompleteTaskCount > 0,
  };
}
