import Link from "next/link";

import { PixelAvatar } from "@/components/avatar/pixel-avatar";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { routes } from "@/lib/routes";

const placeholderHabits = [
  { id: "water", label: "Drink water", streak: 3 },
  { id: "walk", label: "Take a walk", streak: 5 },
  { id: "sleep", label: "Sleep 7+ hours", streak: 2 },
];

export default function AvatarPage() {
  return (
    <AppShell
      title="Your Habit Pet"
      description="Check in daily to keep your pet happy and build streaks."
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <PixelAvatar mood="happy" />
            <p className="text-center text-sm text-muted-foreground">
              Your pet reacts to habits, wellness check-ins, and journal entries.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s habits</CardTitle>
            <CardDescription>
              Custom checkmarks and streak tracking live here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {placeholderHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Checkbox id={habit.id} />
                  <Label htmlFor={habit.id}>{habit.label}</Label>
                </div>
                <Badge variant="secondary">{habit.streak} day streak</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wellness check-in</CardTitle>
            <CardDescription>Rate how you feel today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { id: "energy", label: "Energy" },
              { id: "mood", label: "Mood" },
              { id: "stress", label: "Stress" },
            ].map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Label htmlFor={metric.id}>{metric.label}</Label>
                  <span className="text-muted-foreground">5/10</span>
                </div>
                <input
                  id={metric.id}
                  type="range"
                  min={1}
                  max={10}
                  defaultValue={5}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily journal</CardTitle>
            <CardDescription>
              One entry per day to reflect and help your pet grow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="How did today go?"
            />
          </CardContent>
        </Card>

        <Button asChild className="w-full">
          <Link href={routes.dailyQuiz}>Take today&apos;s quiz</Link>
        </Button>
      </div>
    </AppShell>
  );
}
