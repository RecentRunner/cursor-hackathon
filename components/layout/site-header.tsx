import Link from "next/link";
import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { routes } from "@/lib/routes";
import { hasEnvVars } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-b-foreground/10">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
        <Link href={routes.home} className="font-pixel text-xs tracking-tight">
          Habit Pet
        </Link>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full border-t py-8 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5">
        <p>Build habits. Care for your pet. Feel better every day.</p>
        <ThemeSwitcher />
      </div>
    </footer>
  );
}
