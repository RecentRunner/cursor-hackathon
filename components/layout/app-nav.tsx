"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import {
  Home,
  ListPlus,
  Palette,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { appNavItems, routes, type NavItem } from "@/lib/routes";

const gridColsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
} as const;

const navIcons = {
  [routes.avatar]: Home,
  [routes.customize]: Palette,
  [routes.habits]: ListPlus,
  [routes.dailyQuiz]: Sparkles,
  [routes.shop]: ShoppingBag,
  [routes.profile]: UserRound,
} as const;

type AppNavProps = {
  items?: readonly NavItem[];
};

export const AppNav = forwardRef<HTMLElement, AppNavProps>(function AppNav(
  { items = appNavItems },
  ref,
) {
  const pathname = usePathname();
  const columnCount = Math.min(
    items.length,
    6,
  ) as keyof typeof gridColsClass;

  return (
    <nav
      ref={ref}
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-background/95 shadow-[0_-4px_0_0_hsl(280_45%_28%/0.35)] backdrop-blur supports-[backdrop-filter]:bg-background/90"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-secondary/40"
      />
      <div
        className={cn(
          "mx-auto grid max-w-6xl gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
          gridColsClass[columnCount],
        )}
      >
        {items.map((item) => {
          const Icon = navIcons[item.href];
          const isActive =
            pathname === item.href ||
            (item.href !== routes.avatar && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "bottom-nav-item flex flex-col items-center justify-center gap-1.5 overflow-hidden border-2 px-1 py-2 text-[9px] leading-none transition-colors duration-75",
                isActive
                  ? "border-secondary bg-primary text-primary-foreground shadow-[var(--retro-shadow-sm)]"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon
                className="bottom-nav-item-icon h-5 w-5 shrink-0"
                strokeWidth={2.5}
              />
              <span className="bottom-nav-item-label max-w-full truncate uppercase tracking-wide">
                {item.shortLabel}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
