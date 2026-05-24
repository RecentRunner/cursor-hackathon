import { AppPageHeader } from "@/components/layout/app-page-header";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  wide?: boolean;
};

export function AppShell({
  children,
  title,
  description,
  wide = false,
}: AppShellProps) {
  return (
    <div className="relative bg-background bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.12)_0%,transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--secondary)/0.1)_0%,transparent_40%)]">
      {title ? (
        <AppPageHeader title={title} description={description} wide={wide} />
      ) : null}
      <main
        className={cn(
          "mx-auto px-5 py-6",
          wide ? "max-w-6xl" : "max-w-lg",
        )}
      >
        {children}
      </main>
    </div>
  );
}
