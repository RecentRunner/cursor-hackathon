import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSessionUser } from "@/lib/auth-helpers";

async function ProfileContent() {
  const user = await getSessionUser();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Your sign-in details and session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly />
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-sm">Onboarding</span>
            <Badge variant="secondary">Complete</Badge>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>
            Notification and reminder settings will live here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Daily reminder time
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Pet appearance
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell
      title="Profile"
      description="Manage your account and habit pet preferences."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading profile...</p>}>
        <ProfileContent />
      </Suspense>
    </AppShell>
  );
}
