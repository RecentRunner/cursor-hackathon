"use client";

import { useEffect, useState } from "react";

import { AppNav } from "@/components/layout/app-nav";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getOnboardingStatusClient } from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/client";

export function GlobalBottomNav() {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function syncNavState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setShowNav(false);
        return;
      }

      const status = await getOnboardingStatusClient();
      setShowNav(status?.appComplete === true);
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

  if (!showNav) {
    return null;
  }

  return <AppNav />;
}
