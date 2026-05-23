export const routes = {
  home: "/",
  login: "/auth/login",
  signUp: "/auth/sign-up",
  signUpSuccess: "/auth/sign-up-success",
  onboardingQuiz: "/onboarding/quiz",
  avatar: "/avatar",
  dailyQuiz: "/daily/quiz",
  shop: "/shop",
  profile: "/profile",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export const appNavItems = [
  { href: routes.avatar, label: "Pet", shortLabel: "Pet" },
  { href: routes.dailyQuiz, label: "Daily Quiz", shortLabel: "Quiz" },
  { href: routes.shop, label: "Shop", shortLabel: "Shop" },
  { href: routes.profile, label: "Profile", shortLabel: "Profile" },
] as const;

export function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth");
}

export function isPublicPath(pathname: string) {
  return pathname === routes.home || isAuthPath(pathname);
}
