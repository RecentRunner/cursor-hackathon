import { cn } from "@/lib/utils";

type AppPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  wide?: boolean;
};

export function AppPageHeader({
  title,
  description,
  eyebrow,
  wide = false,
}: AppPageHeaderProps) {
  return (
    <header className="border-b-2 border-border bg-card/60 shadow-[var(--retro-shadow-sm)]">
      <div className={cn("mx-auto px-5 py-5", wide ? "max-w-6xl" : "max-w-lg")}>
        {eyebrow ? (
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-sm">{title}</h1>
        {description ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
