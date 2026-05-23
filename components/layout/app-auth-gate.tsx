import { requireOnboardingComplete } from "@/lib/auth-helpers";

type AppAuthGateProps = {
  children: React.ReactNode;
};

export async function AppAuthGate({ children }: AppAuthGateProps) {
  await requireOnboardingComplete();
  return children;
}
