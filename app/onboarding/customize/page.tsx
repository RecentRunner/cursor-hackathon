import { Suspense } from "react";

import { OnboardingCustomizeAuthGate } from "@/components/layout/onboarding-customize-auth-gate";
import { OnboardingCustomizeForm } from "@/components/onboarding/onboarding-customize-form";

export default function OnboardingCustomizePage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <OnboardingCustomizeAuthGate>
        <OnboardingCustomizeForm />
      </OnboardingCustomizeAuthGate>
    </Suspense>
  );
}
