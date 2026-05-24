"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, UserPlus } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const authNavItems = [
  { href: routes.home, label: "Home", icon: Home },
  { href: routes.login, label: "Sign in", icon: LogIn },
  { href: routes.signUp, label: "Sign up", icon: UserPlus },
] as const;

export function AuthBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-1 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {authNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
