"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PetHabitat } from "@/components/pet/pet-habitat";
import {
  defaultAvatarCustomization,
  getAvatarCustomization,
  type AvatarCustomization,
} from "@/lib/avatar-customization-storage";
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
      <div className="tamagotchi-lcd aspect-[4/3] w-full animate-pulse bg-muted/40" />
    </div>
  );
}

export function LandingPetPreview() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [customization, setCustomization] = useState<AvatarCustomization>(
    defaultAvatarCustomization,
  );

  const loadPreview = useCallback(async () => {
    setIsLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsSignedIn(false);
      setCustomization(defaultAvatarCustomization);
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

  if (isLoading) {
    return <LandingPetPreviewSkeleton />;
  }

  const preview = (
    <PetHabitat
      customization={customization}
      className="w-full max-w-sm"
      showStyleLink={false}
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
