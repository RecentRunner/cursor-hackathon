import Link from "next/link";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type HomeLogoLinkProps = {
  className?: string;
};

export function HomeLogoLink({ className }: HomeLogoLinkProps) {
  return (
    <Link
      href={routes.avatar}
      aria-label="Go to home"
      className={cn(
        "group flex shrink-0 items-center justify-center border-2 border-border bg-card/80 p-2 shadow-[var(--retro-shadow-sm)] transition-transform hover:-translate-y-0.5 hover:border-primary/60",
        className,
      )}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-8"
        style={{ imageRendering: "pixelated" }}
      >
        <rect x="5" y="2" width="6" height="5" fill="#fdba74" stroke="#1e1b4b" strokeWidth="1" />
        <rect x="4" y="3" width="1" height="1" fill="#1e1b4b" />
        <rect x="11" y="3" width="1" height="1" fill="#1e1b4b" />
        <rect x="6" y="5" width="1" height="1" fill="#1e1b4b" />
        <rect x="9" y="5" width="1" height="1" fill="#1e1b4b" />
        <rect x="7" y="6" width="2" height="1" fill="#f472b6" />
        <rect x="4" y="7" width="8" height="5" fill="#6366f1" stroke="#1e1b4b" strokeWidth="1" />
        <rect x="5" y="12" width="2" height="3" fill="#334155" />
        <rect x="9" y="12" width="2" height="3" fill="#334155" />
        <rect x="2" y="4" width="1" height="1" fill="#f472b6" className="opacity-0 group-hover:opacity-100" />
        <rect x="13" y="4" width="1" height="1" fill="#f472b6" className="opacity-0 group-hover:opacity-100" />
      </svg>
    </Link>
  );
}
