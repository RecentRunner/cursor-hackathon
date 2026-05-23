"use client";

import { useEffect, useState } from "react";

import { PixelAvatar } from "@/components/avatar/pixel-avatar";
import { WellnessSlider } from "@/components/daily-quiz/wellness-slider";
import { Badge } from "@/components/ui/badge";
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
  defaultDailyQuizAnswers,
  WELLNESS_SCALE_MAX,
  type DailyQuizAnswers,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";
import {
  getDailyQuizSubmission,
  getTodayDateKey,
  saveDailyQuizSubmission,
} from "@/lib/daily-quiz-storage";

export function DailyQuizForm() {
  const [answers, setAnswers] = useState<DailyQuizAnswers>(
    defaultDailyQuizAnswers,
  );
  const [submission, setSubmission] = useState<DailyQuizSubmission | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const existingSubmission = getDailyQuizSubmission();

    if (existingSubmission?.date === getTodayDateKey()) {
      setSubmission(existingSubmission);
      setAnswers(existingSubmission.answers);
    }

    setIsReady(true);
  }, []);

  const isCompleted = submission !== null;
  const canSubmit = !isCompleted;

  const updateAnswer = <K extends keyof DailyQuizAnswers>(
    key: K,
    value: DailyQuizAnswers[K],
  ) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const savedSubmission = saveDailyQuizSubmission(answers);
    setSubmission(savedSubmission);
  };

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">Loading today&apos;s quiz...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Badge>Today&apos;s check-in</Badge>
        <Badge variant={isCompleted ? "default" : "outline"}>
          {isCompleted ? "Completed" : "Not completed"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wellness</CardTitle>
          <CardDescription>
            Sliders from 1 to 5 for how you&apos;re doing today.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <WellnessSlider
            id="feeling"
            label="How are you feeling today?"
            value={answers.feeling}
            disabled={isCompleted}
            onChange={(value) => updateAnswer("feeling", value)}
          />
          <WellnessSlider
            id="stress"
            label="How stressed are you today?"
            value={answers.stress}
            disabled={isCompleted}
            onChange={(value) => updateAnswer("stress", value)}
          />
          <WellnessSlider
            id="energy"
            label="How much energy do you have?"
            value={answers.energy}
            disabled={isCompleted}
            onChange={(value) => updateAnswer("energy", value)}
          />
          <WellnessSlider
            id="sleep-length"
            label="How long did you sleep?"
            value={answers.sleepLength}
            disabled={isCompleted}
            onChange={(value) => updateAnswer("sleepLength", value)}
          />
          <WellnessSlider
            id="sleep-quality"
            label="How good was your sleep?"
            value={answers.sleepQuality}
            disabled={isCompleted}
            onChange={(value) => updateAnswer("sleepQuality", value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily journal</CardTitle>
          <CardDescription>Write about your day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="journal" className="sr-only">
            Daily journal
          </Label>
          <textarea
            id="journal"
            value={answers.journal}
            disabled={isCompleted}
            onChange={(event) => updateAnswer("journal", event.target.value)}
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            placeholder="Write about your day."
          />
        </CardContent>
      </Card>

      {isCompleted && submission ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <PixelAvatar mood={submission.condition.mood} size="md" />
            <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">Mood</p>
                <p className="font-medium capitalize">
                  {submission.condition.mood}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">Energy</p>
                <p className="font-medium">
                  {submission.condition.energy}/{WELLNESS_SCALE_MAX}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">Health</p>
                <p className="font-medium">
                  {submission.condition.health}/{WELLNESS_SCALE_MAX}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          Complete daily quiz
        </Button>
      )}
    </div>
  );
}
