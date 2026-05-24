import { Suspense } from "react";

import { AppAuthGate } from "@/components/layout/app-auth-gate";
import { DailyReminderProvider } from "@/components/reminders/daily-reminder-provider";
import { InAppReminderBanner } from "@/components/reminders/in-app-reminder-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="bg-background pb-nav" />}>
      <AppAuthGate>
        <DailyReminderProvider />
        <InAppReminderBanner />
        <div className="pb-nav">{children}</div>
      </AppAuthGate>
    </Suspense>
  );
}
