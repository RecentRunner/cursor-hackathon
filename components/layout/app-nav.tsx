"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListPlus,
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
} as const;

const navIcons = {
  [routes.avatar]: Home,
  [routes.habits]: ListPlus,
  [routes.dailyQuiz]: Sparkles,
  [routes.shop]: ShoppingBag,
  [routes.profile]: UserRound,
} as const;

type AppNavProps = {
  items?: readonly NavItem[];
};

export function AppNav({ items = appNavItems }: AppNavProps) {
  const pathname = usePathname();
  const columnCount = Math.min(
    items.length,
    5,
  ) as keyof typeof gridColsClass;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className={cn(
          "mx-auto grid max-w-lg gap-1 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
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
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[9px] font-medium leading-tight transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
