"use client";

import { useEffect, useState } from "react";

import { AppNav } from "@/components/layout/app-nav";
import { AppDataPrefetcher } from "@/components/layout/app-data-prefetcher";
import { AuthBottomNav } from "@/components/layout/auth-bottom-nav";
import {
  NavOffsetProvider,
  useNavOffsetRef,
} from "@/components/layout/nav-offset-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getOnboardingStatusClient } from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/client";

type NavKind = "none" | "auth" | "app";

function MeasuredAppNav() {
  const navRef = useNavOffsetRef();
  return <AppNav ref={navRef} />;
}

function MeasuredAuthNav() {
  const navRef = useNavOffsetRef();
  return <AuthBottomNav ref={navRef} />;
}

export function GlobalBottomNav() {
  const [navKind, setNavKind] = useState<NavKind>("none");

  useEffect(() => {
    const supabase = createClient();

    async function syncNavState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNavKind("auth");
        return;
      }

      const status = await getOnboardingStatusClient();
      setNavKind(status?.appComplete === true ? "app" : "none");
    }

    void syncNavState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncNavState();
    });

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, syncNavState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, syncNavState);
    };
  }, []);

  return (
    <NavOffsetProvider enabled={navKind !== "none"}>
      <AppDataPrefetcher enabled={navKind === "app"} />
      {navKind === "app" ? <MeasuredAppNav /> : null}
      {navKind === "auth" ? <MeasuredAuthNav /> : null}
    </NavOffsetProvider>
  );
}
