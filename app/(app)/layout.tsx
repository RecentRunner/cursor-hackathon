import { Suspense } from "react";

import { AppAuthGate } from "@/components/layout/app-auth-gate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <AppAuthGate>{children}</AppAuthGate>
    </Suspense>
  );
}
