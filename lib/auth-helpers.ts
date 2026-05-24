import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";
import type { User } from "@supabase/supabase-js";

export function hasCompletedOnboarding(user: User) {
  return user.user_metadata?.onboarding_completed === true;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect(routes.login);
  }

  return user;
}

export async function requireOnboardingComplete() {
  const user = await requireSessionUser();

  if (!hasCompletedOnboarding(user)) {
    redirect(routes.onboardingQuiz);
  }

  return user;
}
