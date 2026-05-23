import { redirect } from "next/navigation";

import {
  getSessionUser,
  hasCompletedOnboarding,
} from "@/lib/auth-helpers";
import { routes } from "@/lib/routes";

export async function LoggedInRedirect() {
  const user = await getSessionUser();

  if (user) {
    redirect(
      hasCompletedOnboarding(user) ? routes.avatar : routes.onboardingQuiz,
    );
  }

  return null;
}
