import { redirect } from "next/navigation";

import { requireSessionUser } from "@/lib/auth-helpers";
import {
  fetchOnboardingStatusForUser,
  getRedirectPathFromStatus,
} from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/server";

type OnboardingQuizAuthGateProps = {
  children: React.ReactNode;
};

export async function OnboardingQuizAuthGate({
  children,
}: OnboardingQuizAuthGateProps) {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const status = await fetchOnboardingStatusForUser(user.id, supabase);

  if (status.quizComplete) {
    redirect(getRedirectPathFromStatus(status));
  }

  return children;
}
