import Link from "next/link";
import { Suspense } from "react";

import { PixelAvatar } from "@/components/avatar/pixel-avatar";
import { LoggedInRedirect } from "@/components/layout/logged-in-redirect";
import { SiteFooter, SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/routes";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col">
      <Suspense fallback={null}>
        <LoggedInRedirect />
      </Suspense>

      <SiteHeader />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-5 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Calgary Hackathon MVP
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Build habits. Care for your pixel pet.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Habit Pet turns daily check-ins, wellness sliders, and journaling
              into a simple game. Keep streaks alive, take your once-per-day
              quiz, and watch your pet change with you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={routes.signUp}>Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={routes.login}>Sign in</Link>
              </Button>
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-6 pt-8">
              <PixelAvatar mood="happy" />
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">Your daily loop</p>
                <p className="text-sm text-muted-foreground">
                  Habits, wellness, journal, quiz, shop.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Daily habits",
              description: "Custom checkmarks and streak tracking.",
            },
            {
              title: "Wellness + journal",
              description: "Sliders and a daily reflection box.",
            },
            {
              title: "Pet that responds",
              description: "Avatar mood changes from your input.",
            },
          ].map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
