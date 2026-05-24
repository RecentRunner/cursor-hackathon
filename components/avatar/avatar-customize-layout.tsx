import { AppPageHeader } from "@/components/layout/app-page-header";
import { AppTopBar } from "@/components/layout/app-top-bar";

type AvatarCustomizeLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AvatarCustomizeLayout({
  eyebrow,
  title,
  description,
  children,
}: AvatarCustomizeLayoutProps) {
  return (
    <div className="relative min-h-dvh bg-background bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.12)_0%,transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--secondary)/0.1)_0%,transparent_40%)] pt-topbar">
      <AppTopBar />

      <main className="mx-auto max-w-lg px-4 py-6 lg:max-w-6xl lg:px-5">
        <AppPageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {children}
      </main>
    </div>
  );
}
