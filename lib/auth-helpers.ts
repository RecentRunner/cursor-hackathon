import { redirect } from "next/navigation";

import {
  fetchOnboardingStatusForUser,
  getRedirectPathFromStatus,
} from "@/lib/onboarding-status";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

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

export async function getOnboardingStatusForCurrentUser() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  return fetchOnboardingStatusForUser(user.id, supabase);
}

export async function getOnboardingRedirectPath() {
  const status = await getOnboardingStatusForCurrentUser();
  return getRedirectPathFromStatus(status);
}

export async function requireOnboardingComplete() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const status = await fetchOnboardingStatusForUser(user.id, supabase);

  if (!status.appComplete) {
    redirect(getRedirectPathFromStatus(status));
  }

  return user;
}

export async function requireOnboardingQuizComplete() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const status = await fetchOnboardingStatusForUser(user.id, supabase);

  if (status.appComplete) {
    redirect(routes.avatar);
  }

  if (!status.quizComplete) {
    redirect(routes.onboardingQuiz);
  }

  return user;
}
