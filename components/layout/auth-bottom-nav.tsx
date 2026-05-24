"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { Home, LogIn, UserPlus } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const authNavItems = [
  { href: routes.home, label: "Home", icon: Home },
  { href: routes.login, label: "Sign in", icon: LogIn },
  { href: routes.signUp, label: "Sign up", icon: UserPlus },
] as const;

export const AuthBottomNav = forwardRef<HTMLElement>(function AuthBottomNav(
  _props,
  ref,
) {
  const pathname = usePathname();

  return (
    <nav
      ref={ref}
      className="bottom-nav fixed inset-x-0 bottom-0 z-50 border-t-2 border-border bg-background shadow-[0_-4px_0_0_hsl(280_45%_28%/0.35)]"
      style={{
        bottom: "var(--app-viewport-bottom-offset, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-secondary/40"
      />
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-1 px-2 pb-2 pt-2">
        {authNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "bottom-nav-item flex flex-col items-center justify-center gap-1.5 overflow-hidden border-2 px-1 py-2 font-pixel text-[8px] leading-none transition-colors duration-75",
                isActive
                  ? "border-secondary bg-primary text-primary-foreground shadow-[var(--retro-shadow-sm)]"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="bottom-nav-item-icon h-5 w-5 shrink-0" strokeWidth={2.5} />
              <span className="bottom-nav-item-label max-w-full truncate uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});
