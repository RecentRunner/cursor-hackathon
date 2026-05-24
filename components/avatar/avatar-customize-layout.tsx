import { AppPageHeader } from "@/components/layout/app-page-header";

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
    <div className="relative min-h-dvh flex-1 bg-background">
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
