"use client";

import { Music2 } from "lucide-react";

import { useAmbientAudioOptional } from "@/components/layout/ambient-audio-provider";
import { cn } from "@/lib/utils";

export function HeaderMusicButton() {
  const ambient = useAmbientAudioOptional();

  if (!ambient?.enabled) {
    return null;
  }

  const { panelOpen, togglePanel, isPlaying, muted, volume } = ambient;
  const active = isPlaying && !muted && volume > 0;

  return (
    <button
      type="button"
      data-ambient-audio-trigger
      aria-label={panelOpen ? "Close music player" : "Open music player"}
      aria-expanded={panelOpen}
      aria-pressed={panelOpen}
      onClick={togglePanel}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center border-2 bg-background/80 shadow-[var(--retro-shadow-sm)] transition-transform",
        panelOpen
          ? "border-secondary bg-secondary/15 text-secondary"
          : "border-border/70 text-foreground hover:border-secondary/50 hover:bg-secondary/10",
        active && !panelOpen && "ambient-radio-nav-active",
      )}
    >
      <span className="relative flex items-center justify-center">
        <Music2 aria-hidden="true" className="size-4" />
        {active ? (
          <span className="ambient-radio-nav-dot" aria-hidden="true" />
        ) : null}
      </span>
    </button>
  );
}
