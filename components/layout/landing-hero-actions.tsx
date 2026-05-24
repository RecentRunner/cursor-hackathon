import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-helpers";
import { routes } from "@/lib/routes";

export async function LandingHeroActions() {
  const user = await getSessionUser();

  if (user) {
    return (
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={routes.avatar}>Go to your bit</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild size="lg">
        <Link href={routes.signUp}>Get started</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href={routes.login}>Sign in</Link>
      </Button>
    </div>
  );
}
