"use client";

import { useEffect } from "react";

import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  invalidateAppTabDataCache,
  prefetchAppTabData,
} from "@/lib/app-tab-data-cache";

type AppDataPrefetcherProps = {
  enabled: boolean;
};

export function AppDataPrefetcher({ enabled }: AppDataPrefetcherProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void prefetchAppTabData();

    const handleDataUpdated = () => {
      invalidateAppTabDataCache();
      void prefetchAppTabData({ force: true });
    };

    window.addEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);

    return () => {
      window.removeEventListener(HABIT_PET_DATA_UPDATED_EVENT, handleDataUpdated);
    };
  }, [enabled]);

  return null;
}
