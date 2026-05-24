import { AppPageHeader } from "@/components/layout/app-page-header";
import { AppTopBar } from "@/components/layout/app-top-bar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  wide?: boolean;
  /** Use remaining viewport height between top bar and bottom nav. */
  fillViewport?: boolean;
  /** Center page body horizontally (header stays left-aligned in the content column). */
  centered?: boolean;
};

const contentWidthClass = {
  default: "max-w-lg lg:max-w-4xl",
  wide: "max-w-lg lg:max-w-6xl",
} as const;

export function AppShell({
  children,
  title,
  description,
  wide = false,
  fillViewport = false,
  centered = false,
}: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background pt-topbar">
      <AppTopBar />
      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-4 py-6 lg:px-5",
          fillViewport
            ? "min-h-[calc(100dvh-var(--app-topbar-height)-var(--app-nav-offset)-env(safe-area-inset-top,0px))]"
            : null,
          wide ? contentWidthClass.wide : contentWidthClass.default,
        )}
      >
        {title ? (
          <AppPageHeader title={title} description={description} />
        ) : null}
        <div
          className={cn(
            fillViewport ? "pet-viewport-stage flex w-full flex-1 flex-col" : "contents",
            centered ? "items-center" : null,
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
