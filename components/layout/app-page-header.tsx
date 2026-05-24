type AppPageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function AppPageHeader({
  title,
  description,
  eyebrow,
}: AppPageHeaderProps) {
  return (
    <header className="mb-6 border-b-2 border-border bg-card/60 px-1 pb-5 shadow-[var(--retro-shadow-sm)]">
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
    </header>
  );
}
