import { Suspense } from "react";

import { AvatarPageContent } from "@/components/avatar/avatar-page-content";
import { AppShell } from "@/components/layout/app-shell";

export default function AvatarPage() {
  return (
    <AppShell
      title="Your Habit Pet"
      description="Customize your pet, complete AI-personalized daily tasks, and track their mood from your wellness check-in."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <AvatarPageContent />
      </Suspense>
    </AppShell>
  );
}
