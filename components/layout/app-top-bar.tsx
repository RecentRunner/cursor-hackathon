"use client";

import { usePathname } from "next/navigation";

import { HabitBrand } from "@/components/layout/habit-brand";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AppTopBarProps = {
  className?: string;
};

export function AppTopBar({ className }: AppTopBarProps) {
  const pathname = usePathname();
  const isHome =
    pathname === routes.home || pathname === routes.avatar;

  return (
    <header
      className={cn(
        "app-top-bar fixed inset-x-0 top-0 z-40 border-b-2 border-border bg-background/95 shadow-[var(--retro-shadow-sm)] backdrop-blur supports-[backdrop-filter]:bg-background/90",
        className,
      )}
      style={{
        height: "var(--app-topbar-height)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center px-4">
        <HabitBrand aria-current={isHome ? "page" : undefined} />
      </div>
    </header>
  );
}
