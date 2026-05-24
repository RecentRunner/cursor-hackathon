import { HabitTracker } from "@/components/habits/habit-tracker";
import { AppShell } from "@/components/layout/app-shell";

export default function HabitsPage() {
  return (
    <AppShell
      title="Habits"
      description="Add custom habits and see how your daily tasks are chosen."
    >
      <HabitTracker mode="manage" />
    </AppShell>
  );
}
