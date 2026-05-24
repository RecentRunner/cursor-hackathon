import { AuthBottomNav } from "@/components/layout/auth-bottom-nav";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <AuthBottomNav />
    </>
  );
}
