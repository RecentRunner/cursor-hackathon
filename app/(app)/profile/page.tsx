import { Suspense } from "react";

import { ProfilePreferencesForm } from "@/components/profile/profile-preferences-form";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth-helpers";

async function ProfileContent() {
  const user = await getSessionUser();

  return <ProfilePreferencesForm email={user?.email} />;
}

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile & preferences"
      description="Edit account details and personalize your experience."
    >
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        }
      >
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}
