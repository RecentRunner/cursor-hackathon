type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="min-h-svh bg-background">
      {(title || description) && (
        <header className="border-b border-border/60 bg-card/40">
          <div className="mx-auto max-w-lg px-5 py-5">
            {title ? (
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </header>
      )}
      <main className="mx-auto max-w-lg px-5 py-6">{children}</main>
    </div>
  );
}
