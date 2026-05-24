import { HabitTracker } from "@/components/habits/habit-tracker";
import { AppShell } from "@/components/layout/app-shell";

export default function HabitsPage() {
  return (
    <AppShell
      title="Habits"
      description="Complete today's tasks and manage your habit list."
    >
      <HabitTracker mode="all" />
    </AppShell>
  );
}
