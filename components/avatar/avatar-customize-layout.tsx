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
    <div className="relative min-h-dvh bg-background pt-topbar">
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
