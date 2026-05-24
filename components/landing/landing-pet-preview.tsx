"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { PetHabitat } from "@/components/pet/pet-habitat";
import {
  defaultAvatarCustomization,
  getAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
import { getGuestLandingPetCustomization } from "@/lib/landing-random-pet";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function LandingPetPreviewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="tamagotchi-shell w-full max-w-sm overflow-hidden p-3 sm:p-4"
    >
      <div className="mb-3 space-y-2 border-b-2 border-border/60 pb-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-2 w-16 animate-pulse rounded bg-muted" />
      </div>
      <div className="tamagotchi-lcd tamagotchi-lcd-landing animate-pulse bg-muted/40" />
    </div>
  );
}

const SPRITE_HEIGHT = 32;
const SPRITE_WIDTH = 16;
/** Target rendered pet height as a fraction of LCD height */
const TARGET_HEIGHT_RATIO = 0.42;
/** Keep pet from spanning too much of the LCD width */
const TARGET_WIDTH_RATIO = 0.2;

function computeLandingPetScale(lcdWidth: number, lcdHeight: number): number {
  if (lcdWidth <= 0 || lcdHeight <= 0) {
    return 4;
  }

  const scaleFromHeight = Math.round(
    (lcdHeight * TARGET_HEIGHT_RATIO) / SPRITE_HEIGHT,
  );
  const scaleFromWidth = Math.round(
    (lcdWidth * TARGET_WIDTH_RATIO) / SPRITE_WIDTH,
  );

  return Math.min(5, Math.max(2, Math.min(scaleFromHeight, scaleFromWidth)));
}

export function LandingPetPreview() {
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [petScale, setPetScale] = useState(4);
  const [customization, setCustomization] = useState<AvatarCustomization>(
    defaultAvatarCustomization,
  );

  const lcdRef = useCallback((node: HTMLDivElement | null) => {
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;

    if (!node) {
      return;
    }

    const updateScale = (width: number, height: number) => {
      setPetScale(computeLandingPetScale(width, height));
    };

    const rect = node.getBoundingClientRect();
    updateScale(rect.width, rect.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        updateScale(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(node);
    resizeObserverRef.current = observer;
  }, []);

  const loadPreview = useCallback(async () => {
    setIsLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSignedIn(false);
      setCustomization(getGuestLandingPetCustomization());
      setIsLoading(false);
      return;
    }

    setIsSignedIn(true);

    try {
      setCustomization(await getAvatarCustomization());
    } catch {
      setCustomization(defaultAvatarCustomization);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  useEffect(() => {
    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  if (isLoading) {
    return <LandingPetPreviewSkeleton />;
  }

  const preview = (
    <PetHabitat
      customization={customization}
      className="w-full max-w-sm"
      showStyleLink={false}
      petScale={petScale}
      lcdClassName="tamagotchi-lcd-landing"
      lcdRef={lcdRef}
    />
  );

  if (isSignedIn) {
    return (
      <Link
        href={routes.avatar}
        aria-label="Go to your pet"
        className={cn(
          "block w-full max-w-sm rounded-sm transition-transform",
          "hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {preview}
      </Link>
    );
  }

  return preview;
}
