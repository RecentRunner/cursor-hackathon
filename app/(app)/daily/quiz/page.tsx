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

const quizQuestion = {
  prompt: "What is one small win you can celebrate today?",
  options: [
    "I showed up for myself",
    "I rested when I needed to",
    "I reached out to someone",
    "I kept a promise to myself",
  ],
};

export default function DailyQuizPage() {
  return (
    <AppShell
      title="Daily quiz"
      description="One quiz per day. Come back tomorrow for a new prompt."
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Badge>Today&apos;s prompt</Badge>
          <Badge variant="outline">Not completed</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{quizQuestion.prompt}</CardTitle>
            <CardDescription>
              Pick the answer that fits best. You can only submit once per day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quizQuestion.options.map((option) => (
              <Button
                key={option}
                variant="outline"
                className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
              >
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
