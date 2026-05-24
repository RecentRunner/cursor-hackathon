import { Suspense } from "react";

import { CustomizePageContent } from "@/components/avatar/customize-page-content";
import { AppShell } from "@/components/layout/app-shell";

export default function CustomizePage() {
  return (
    <AppShell
      wide
      title="Customize your bit"
      description="Change your bit's name, styles, colors, and room."
    >
      <Suspense fallback={<p className="text-xs text-muted-foreground">Loading...</p>}>
        <CustomizePageContent />
      </Suspense>
    </AppShell>
  );
}
