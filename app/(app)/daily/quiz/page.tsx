import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function DailyQuizPage() {
  redirect(`${routes.avatar}#bit-daily-quiz`);
}
