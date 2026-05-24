import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth-helpers";
import {
  fetchOnboardingStatusForUser,
} from "@/lib/onboarding-status";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

type OnboardingCustomizeAuthGateProps = {
  children: React.ReactNode;
};

export async function OnboardingCustomizeAuthGate({
  children,
}: OnboardingCustomizeAuthGateProps) {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const status = await fetchOnboardingStatusForUser(user.id, supabase);

  if (status.appComplete) {
    redirect(routes.avatar);
  }

  if (!status.quizComplete) {
    redirect(routes.onboardingQuiz);
  }

  return children;
}
