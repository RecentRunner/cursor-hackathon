import Link from "next/link";
import { Palette } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type PetStyleLinkProps = {
  className?: string;
};

export function PetStyleLink({ className }: PetStyleLinkProps) {
  return (
    <Link
      href={routes.customize}
      aria-label="Customize pet style"
      title="Style"
      className={cn(
        "flex shrink-0 items-center justify-center border-2 border-border bg-card/90 p-2 shadow-[var(--retro-shadow-sm)] transition-transform hover:-translate-y-0.5 hover:border-primary/60",
        className,
      )}
    >
      <Palette aria-hidden="true" className="size-5" strokeWidth={2.5} />
    </Link>
  );
}
