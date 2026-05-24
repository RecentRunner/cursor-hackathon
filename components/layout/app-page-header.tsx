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
    <header className="mb-6 border-b-2 border-border pb-5">
      {eyebrow ? (
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-base">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
