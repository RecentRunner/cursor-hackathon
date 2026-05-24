"use client";

import { useEffect, useState } from "react";

import { AppNav } from "@/components/layout/app-nav";
import { createClient } from "@/lib/supabase/client";

export function GlobalBottomNav() {
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function syncNavState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setShowNav(
        !!user && user.user_metadata?.onboarding_completed === true,
      );
    }

    void syncNavState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncNavState();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!showNav) {
    return null;
  }

  return <AppNav />;
}
