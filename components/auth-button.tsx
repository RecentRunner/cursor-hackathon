import Link from "next/link";

import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { routes } from "@/lib/routes";

export async function AuthButton() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return user ? (
    <LogoutButton />
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href={routes.login}>Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href={routes.signUp}>Sign up</Link>
      </Button>
    </div>
  );
}
