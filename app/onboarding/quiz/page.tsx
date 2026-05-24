import { Suspense } from "react";

import { OnboardingQuizAuthGate } from "@/components/layout/onboarding-quiz-auth-gate";
import { OnboardingQuizForm } from "@/components/onboarding/onboarding-quiz-form";

export default function OnboardingQuizPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <OnboardingQuizAuthGate>
        <OnboardingQuizForm />
      </OnboardingQuizAuthGate>
    </Suspense>
  );
}
