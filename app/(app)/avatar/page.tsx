import { Suspense } from "react";

import { AvatarPageContent } from "@/components/avatar/avatar-page-content";
import { AppShell } from "@/components/layout/app-shell";

export default function AvatarPage() {
  return (
    <AppShell
      title="Your bit"
      description="Watch your digital self roam, breathe, and react to how you care for yourself."
      fillViewport
      centered
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <AvatarPageContent />
      </Suspense>
    </AppShell>
  );
}
