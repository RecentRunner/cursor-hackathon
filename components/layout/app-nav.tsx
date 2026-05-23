"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Sparkles, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { appNavItems, routes } from "@/lib/routes";

const navIcons = {
  [routes.avatar]: Home,
  [routes.dailyQuiz]: Sparkles,
  [routes.shop]: ShoppingBag,
  [routes.profile]: UserRound,
} as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {appNavItems.map((item) => {
          const Icon = navIcons[item.href];
          const isActive =
            pathname === item.href ||
            (item.href !== routes.avatar && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors",
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
