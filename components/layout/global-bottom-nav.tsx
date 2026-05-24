"use client";

import { useEffect, useState } from "react";

import { AppNav } from "@/components/layout/app-nav";
import { AppDataPrefetcher } from "@/components/layout/app-data-prefetcher";
import {
  NavOffsetProvider,
  useNavOffsetRef,
} from "@/components/layout/nav-offset-provider";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getOnboardingStatusClient } from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/client";

function MeasuredAppNav() {
  const navRef = useNavOffsetRef();

  return <AppNav ref={navRef} />;
}

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

  return (
    <NavOffsetProvider enabled={showNav}>
      <AppDataPrefetcher enabled={showNav} />
      {showNav ? <MeasuredAppNav /> : null}
    </NavOffsetProvider>
  );
}
