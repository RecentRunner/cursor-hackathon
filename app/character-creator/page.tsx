import { redirect } from "next/navigation";

import { routes } from "@/lib/routes";

export default function CharacterCreatorPage() {
  redirect(`${routes.avatar}?tab=customize`);
}
