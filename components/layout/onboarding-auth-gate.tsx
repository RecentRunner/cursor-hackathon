import { redirect } from "next/navigation";

import {
  hasCompletedOnboarding,
  requireSessionUser,
} from "@/lib/auth-helpers";
import { routes } from "@/lib/routes";

type OnboardingAuthGateProps = {
  children: React.ReactNode;
};

export async function OnboardingAuthGate({ children }: OnboardingAuthGateProps) {
  const user = await requireSessionUser();

  if (hasCompletedOnboarding(user)) {
    redirect(routes.avatar);
  }

  return children;
}
