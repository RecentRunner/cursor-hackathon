"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  focusTopicOptions,
  saveOnboardingPreferences,
} from "@/lib/profile-preferences-storage";
import { routes } from "@/lib/routes";

export function OnboardingQuizForm() {
  const router = useRouter();
  const [focusTopic, setFocusTopic] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!focusTopic) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saveOnboardingPreferences(focusTopic);
      router.push(routes.onboardingCustomize);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save onboarding answers.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-svh bg-background">
      <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-5 py-10">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Step 1 of 2
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Welcome to Habit Pet
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a focus area, then design your pet in the next step.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              What habit do you most want to build first?
            </CardTitle>
            <CardDescription>
              This helps personalize your daily tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {focusTopicOptions.map((option) => {
              const selected = focusTopic === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFocusTopic(option)}
                  className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <Label className="cursor-pointer">{option}</Label>
                </button>
              );
            })}

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <Button
              className="w-full"
              disabled={!focusTopic || isSubmitting}
              onClick={() => void handleContinue()}
            >
              {isSubmitting ? "Saving..." : "Continue to avatar"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
