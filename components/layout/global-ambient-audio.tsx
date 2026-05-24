"use client";

import { useEffect, useState } from "react";

import { AvatarAmbientAudio } from "@/components/avatar/avatar-ambient-audio";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import { getOnboardingStatusClient } from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/client";

export function GlobalAmbientAudio() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function syncAudioState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEnabled(false);
        return;
      }

      const status = await getOnboardingStatusClient();
      setEnabled(status?.appComplete === true);
    }

    void syncAudioState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncAudioState();
    });

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, syncAudioState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, syncAudioState);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <AvatarAmbientAudio />;
}
