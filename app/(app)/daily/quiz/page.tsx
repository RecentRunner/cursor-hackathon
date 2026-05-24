import { DailyQuizForm } from "@/components/daily-quiz/daily-quiz-form";
import { AppShell } from "@/components/layout/app-shell";

export default function DailyQuizPage() {
  return (
    <AppShell
      title="Daily quiz"
      description="Complete your once-per-day wellness sliders and journal."
    >
      <DailyQuizForm />
    </AppShell>
  );
}
