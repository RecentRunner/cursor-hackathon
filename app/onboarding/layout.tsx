import { Suspense } from "react";

import { OnboardingAuthGate } from "@/components/layout/onboarding-auth-gate";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <OnboardingAuthGate>{children}</OnboardingAuthGate>
    </Suspense>
  );
}
