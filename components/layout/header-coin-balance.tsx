"use client";

import { Coins } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getCoins } from "@/lib/avatar-progression-storage";
import { createClient } from "@/lib/supabase/client";

export function HeaderCoinBalance() {
  const [coins, setCoins] = useState<number | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSignedIn(false);
      setCoins(null);
      return;
    }

    setIsSignedIn(true);

    try {
      setCoins(await getCoins());
    } catch {
      setCoins(0);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    void refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, refresh);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, refresh);
    };
  }, [refresh]);

  if (!isSignedIn) {
    return null;
  }

  return (
    <div
      className="inline-flex h-10 items-center justify-center gap-2 border-2 border-primary/35 bg-primary/10 px-4 font-pixel text-[10px] font-normal uppercase tracking-wide text-primary shadow-[var(--retro-shadow-sm)]"
      aria-label={
        coins === null ? "Loading point balance" : `${coins} points available`
      }
    >
      <Coins aria-hidden="true" className="size-4 shrink-0" />
      <span className="tabular-nums leading-none">
        {coins === null ? "…" : coins}
      </span>
      <span className="leading-none text-primary/80">pts</span>
    </div>
  );
}
