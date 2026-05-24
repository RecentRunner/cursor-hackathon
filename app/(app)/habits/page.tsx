import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function HabitsPage() {
  redirect(`${routes.avatar}#bit-daily-tasks`);
}
