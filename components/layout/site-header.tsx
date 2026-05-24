import { Suspense } from "react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { HabitBrand } from "@/components/layout/habit-brand";
import { HeaderCoinBalance } from "@/components/layout/header-coin-balance";
import { routes } from "@/lib/routes";
import { hasEnvVars } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background"
      style={{
        height: "var(--app-topbar-height)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between gap-4 px-5">
        <HabitBrand href={routes.home} size="nav" framed={false} />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <>
              <Suspense fallback={null}>
                <HeaderCoinBalance />
              </Suspense>
              <Suspense fallback={null}>
                <AuthButton />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
