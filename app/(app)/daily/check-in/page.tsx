import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function DailyCheckInPage() {
  redirect(`${routes.avatar}#bit-daily-check-in`);
}
