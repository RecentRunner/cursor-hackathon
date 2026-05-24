import { AvatarStatusCard } from "@/components/avatar/avatar-status-card";
import { DailyQuizLinkButton } from "@/components/daily-quiz/daily-quiz-link-button";
import { HabitTracker } from "@/components/habits/habit-tracker";
import { AppShell } from "@/components/layout/app-shell";

export default function AvatarPage() {
  return (
    <AppShell
      title="Your Habit Pet"
      description="Today's tasks are personalized from your preferences and daily quiz."
    >
      <div className="flex flex-col gap-6">
        <AvatarStatusCard />
        <HabitTracker />
        <DailyQuizLinkButton />
      </div>
    </AppShell>
  );
}
