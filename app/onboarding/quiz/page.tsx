"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PixelAvatar } from "@/components/avatar/pixel-avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

const questions = [
  {
    id: "focus",
    prompt: "What habit do you most want to build first?",
    options: ["Sleep", "Movement", "Hydration", "Mindfulness"],
  },
  {
    id: "pet-name",
    prompt: "Pick a starter vibe for your pet.",
    options: ["Calm", "Energetic", "Curious", "Cozy"],
  },
];

export default function OnboardingQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;

  const handleSelect = (value: string) => {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value,
    }));
  };

  const handleContinue = async () => {
    if (!answers[currentQuestion.id]) {
      return;
    }

    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          onboarding_answers: answers,
        },
      });

      if (updateError) {
        throw updateError;
      }

      router.push(routes.avatar);
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
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <PixelAvatar mood="neutral" size="md" />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Step {step + 1} of {questions.length}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Welcome to Habit Pet
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{currentQuestion.prompt}</CardTitle>
            <CardDescription>
              This helps personalize your pet and starting habits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
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
              disabled={!answers[currentQuestion.id] || isSubmitting}
              onClick={handleContinue}
            >
              {isSubmitting
                ? "Saving..."
                : isLastStep
                  ? "Meet your pet"
                  : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
