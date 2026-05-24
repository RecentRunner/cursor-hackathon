import { AppPageHeader } from "@/components/layout/app-page-header";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  wide?: boolean;
};

const contentWidthClass = {
  default: "max-w-lg md:max-w-2xl lg:max-w-4xl",
  wide: "max-w-lg md:max-w-3xl lg:max-w-6xl",
} as const;

export function AppShell({
  children,
  title,
  description,
  wide = false,
}: AppShellProps) {
  return (
    <div className="relative min-h-dvh bg-background bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.12)_0%,transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--secondary)/0.1)_0%,transparent_40%)] pt-topbar">
      <AppTopBar />
      <main
        className={cn(
          "mx-auto px-4 py-6 md:px-5",
          wide ? contentWidthClass.wide : contentWidthClass.default,
        )}
      >
        {title ? (
          <AppPageHeader title={title} description={description} />
        ) : null}
        {children}
      </main>
    </div>
  );
}
