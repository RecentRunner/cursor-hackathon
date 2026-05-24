"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(routes.home);
    router.refresh();
  };

  return (
    <Button
      onClick={logout}
      aria-label="Logout"
      className="h-10 w-10 shrink-0 px-0 sm:w-auto sm:px-4"
    >
      <LogOut aria-hidden="true" className="sm:hidden" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
