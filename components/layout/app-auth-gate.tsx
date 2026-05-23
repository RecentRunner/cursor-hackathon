type AppAuthGateProps = {
  children: React.ReactNode;
};
export async function AppAuthGate({ children }: AppAuthGateProps) {
  // Temporary: allow guest access while testing app pages from the bottom nav.
  return children;
}
