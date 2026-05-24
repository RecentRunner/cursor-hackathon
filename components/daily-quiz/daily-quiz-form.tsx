"use client";

import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  formatSleepHours,
  SLEEP_HOURS_MAX,
  SLEEP_HOURS_MIN,
  SLEEP_HOURS_STEP,
  WELLNESS_SCALE_MAX,
  type DailyQuizAnswers,
  type DailyQuizSubmission,
} from "@/lib/avatar-state";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  getAvatarConditionForToday,
  getDailyEntryForToday,
  saveDailyEntry,
} from "@/lib/daily-quiz-storage";
import { JOURNAL_MAX_LENGTH } from "@/lib/journal-safety";

export function DailyQuizForm() {
  const [answers, setAnswers] = useState<DailyQuizAnswers>(
    defaultDailyQuizAnswers,
  );
  const [journal, setJournal] = useState("");
  const [submission, setSubmission] = useState<DailyQuizSubmission | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [liveCondition, setLiveCondition] = useState(
    submission?.condition ?? null,
  );

  const refreshLiveCondition = useCallback(async () => {
    setLiveCondition(await getAvatarConditionForToday());
  }, []);

  useEffect(() => {
    async function loadDailyCheckIn() {
      try {
        const existingEntry = await getDailyEntryForToday();

        if (existingEntry) {
          setSubmission(existingEntry);
          setAnswers(existingEntry.answers);
          setJournal(existingEntry.journal);
          setLiveCondition(existingEntry.condition);
        } else {
          await refreshLiveCondition();
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load today's check-in.",
        );
      } finally {
        setIsReady(true);
      }
    }

    void loadDailyCheckIn();
  }, [refreshLiveCondition]);

  useEffect(() => {
    const handleDataUpdated = () => {
      void refreshLiveCondition();
    };

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);

    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [refreshLiveCondition]);

  const isCompleted = submission !== null;
  const canSubmit = !isCompleted && !isSubmitting;

  const updateAnswer = <K extends keyof DailyQuizAnswers>(
    key: K,
    value: DailyQuizAnswers[K],
  ) => {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const savedEntry = await saveDailyEntry(answers, journal);
      setSubmission(savedEntry);
      setLiveCondition(savedEntry.condition);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save your daily check-in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <p className="text-sm text-muted-foreground">Loading today&apos;s quiz...</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {isCompleted && submission ? (
        <>
          <Card className="border-primary/40 bg-primary/10">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="rounded-full bg-primary/15 p-2.5">
                <CheckCircle2
                  aria-hidden="true"
                  className="h-7 w-7 text-primary"
                />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight">
                  Today&apos;s quiz is complete
                </p>
                <p className="text-sm text-muted-foreground">
                  Your wellness check-in and journal are saved for today. You
                  can review your answers below, and come back tomorrow for
                  your next quiz.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your pet today</CardTitle>
              <CardDescription>
                Based on your wellness check-in and completed habits today.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <PixelAvatar
                mood={(liveCondition ?? submission.condition).mood}
                size="md"
              />
              <div className="grid w-full grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Mood</p>
                  <p className="font-medium capitalize">
                    {(liveCondition ?? submission.condition).mood}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Energy</p>
                  <p className="font-medium">
                    {(liveCondition ?? submission.condition).energy}/
                    {WELLNESS_SCALE_MAX}
                  </p>
                </div>
                <div className="rounded-lg border bg-background px-3 py-2">
                  <p className="text-muted-foreground">Health</p>
                  <p className="font-medium">
                    {(liveCondition ?? submission.condition).health}/
                    {WELLNESS_SCALE_MAX}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <Badge>Today&apos;s check-in</Badge>
          <Badge variant="outline">Not completed</Badge>
        </div>
      )}

      <Card className={isCompleted ? "opacity-90" : undefined}>
        <CardHeader>
          <CardTitle className="text-base">
            {isCompleted ? "Your answers today" : "Wellness"}
          </CardTitle>
          <CardDescription>
            {isCompleted
              ? "These fields are locked until tomorrow's quiz."
              : "Rate your wellness from 1 to 5. Sleep length uses hours."}
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
            min={SLEEP_HOURS_MIN}
            max={SLEEP_HOURS_MAX}
            step={SLEEP_HOURS_STEP}
            formatValue={formatSleepHours}
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

      <Card className={isCompleted ? "opacity-90" : undefined}>
        <CardHeader>
          <CardTitle className="text-base">Daily journal</CardTitle>
          <CardDescription>
            {isCompleted
              ? "Your journal entry for today."
              : "Write about your day."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label htmlFor="journal" className="sr-only">
            Daily journal
          </Label>
          <textarea
            id="journal"
            value={journal}
            disabled={isCompleted}
            maxLength={JOURNAL_MAX_LENGTH}
            onChange={(event) => setJournal(event.target.value)}
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            placeholder="Write about your day."
          />
          {!isCompleted ? (
            <p className="text-xs text-muted-foreground">
              {journal.length}/{JOURNAL_MAX_LENGTH} characters
            </p>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {!isCompleted ? (
        <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
          {isSubmitting ? "Saving..." : "Complete daily quiz"}
        </Button>
      ) : null}
    </div>
  );
}
