import { routes } from "@/lib/routes";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type OnboardingStatus = {
  quizComplete: boolean;
  avatarComplete: boolean;
  appComplete: boolean;
};

type StatusRow = {
  onboarding_quiz_complete: boolean | null;
  onboarding_complete: boolean | null;
};

type AvatarRow = {
  avatar_customized: boolean | null;
};

export function getRedirectPathFromStatus(status: OnboardingStatus) {
  if (status.appComplete) {
    return routes.avatar;
  }

  if (status.quizComplete) {
    return routes.onboardingCustomize;
  }

  return routes.onboardingQuiz;
}

export function mapRowsToOnboardingStatus(
  profile: StatusRow | null | undefined,
  avatar: AvatarRow | null | undefined,
): OnboardingStatus {
  return {
    quizComplete: profile?.onboarding_quiz_complete === true,
    avatarComplete: avatar?.avatar_customized === true,
    appComplete: profile?.onboarding_complete === true,
  };
}

export async function fetchOnboardingStatusForUser(
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerClient>>,
): Promise<OnboardingStatus> {
  const [{ data: profile }, { data: avatar }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_quiz_complete, onboarding_complete")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("avatar_state")
      .select("avatar_customized")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  return mapRowsToOnboardingStatus(
    profile as StatusRow | null,
    avatar as AvatarRow | null,
  );
}

export async function getOnboardingStatusClient(): Promise<OnboardingStatus | null> {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: avatar }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_quiz_complete, onboarding_complete")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("avatar_state")
      .select("avatar_customized")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return mapRowsToOnboardingStatus(
    profile as StatusRow | null,
    avatar as AvatarRow | null,
  );
}
