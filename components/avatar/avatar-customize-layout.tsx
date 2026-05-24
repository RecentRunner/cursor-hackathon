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
    <div className="relative bg-background bg-[radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.12)_0%,transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--secondary)/0.1)_0%,transparent_40%)]">
      <AppPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <main className="mx-auto max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
