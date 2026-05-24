import { redirect } from "next/navigation";

import { getOnboardingRedirectPath, getSessionUser } from "@/lib/auth-helpers";

export async function LoggedInRedirect() {
  const user = await getSessionUser();

  if (user) {
    redirect(await getOnboardingRedirectPath());
  }

  return null;
}
