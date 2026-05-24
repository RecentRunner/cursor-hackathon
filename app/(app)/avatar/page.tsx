import { Suspense } from "react";

import { AvatarPageContent } from "@/components/avatar/avatar-page-content";
import { AppShell } from "@/components/layout/app-shell";

export default function AvatarPage() {
  return (
    <AppShell
      title="Your Habit Pet"
      description="View your pet, rename them, customize their look, and track today's habits."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <AvatarPageContent />
      </Suspense>
    </AppShell>
  );
}
