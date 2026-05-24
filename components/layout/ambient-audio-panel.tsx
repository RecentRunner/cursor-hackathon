"use client";

import { SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { useAmbientAudio } from "@/components/layout/ambient-audio-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AVATAR_AMBIENT_PLAYLIST } from "@/lib/avatar-audio";

export function AmbientAudioPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    panelOpen,
    setPanelOpen,
    volume,
    muted,
    trackIndex,
    currentTrack,
    autoplayBlocked,
    loadError,
    handleToggleMute,
    handleVolumeChange,
    handleSkip,
    handleUserActivate,
  } = useAmbientAudio();

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (panelRef.current?.contains(target)) {
        return;
      }

      if (
        target instanceof Element &&
        target.closest("[data-ambient-audio-trigger]")
      ) {
        return;
      }

      setPanelOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
    };
  }, [panelOpen, setPanelOpen]);

  if (!panelOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="ambient-radio-window fixed z-50 w-[min(100vw-2rem,19rem)]"
      style={{
        top: "calc(var(--app-topbar-height) + env(safe-area-inset-top, 0px) + 0.5rem)",
        right: "max(1rem, calc((100vw - min(100vw, 64rem)) / 2 + 1.25rem))",
      }}
      onPointerDown={handleUserActivate}
      role="dialog"
      aria-modal="false"
      aria-label="Ambient music player"
    >
      <div className="ambient-radio-window-chrome">
        <div className="flex items-center justify-between gap-2 border-b-2 border-border/70 px-3 py-2">
          <div className="min-w-0">
            <p className="font-pixel text-[8px] uppercase tracking-[0.22em] text-secondary">
              Bit Tunes
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Ambient radio
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 rounded-none border border-border/60"
            aria-label="Close music player"
            onClick={() => setPanelOpen(false)}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="space-y-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Label
                htmlFor="avatar-ambient-volume"
                className="font-pixel text-[8px] uppercase tracking-wide text-muted-foreground"
              >
                Now playing
              </Label>
              <p className="truncate text-sm text-foreground">
                {currentTrack?.label ?? "Track"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-none border-2 shadow-[var(--retro-shadow-sm)]"
                aria-label="Skip to next track"
                onClick={handleSkip}
              >
                <SkipForward aria-hidden="true" className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-none border-2 shadow-[var(--retro-shadow-sm)]"
                aria-label={
                  muted || volume === 0
                    ? "Unmute ambient audio"
                    : "Mute ambient audio"
                }
                aria-pressed={muted || volume === 0}
                onClick={handleToggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <Volume2 aria-hidden="true" className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          <input
            id="avatar-ambient-volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            aria-label="Ambient audio volume"
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            className="ambient-radio-slider w-full"
          />

          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span>
              Track {trackIndex + 1}/{AVATAR_AMBIENT_PLAYLIST.length}
            </span>
            <span className="ambient-radio-eq" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </div>

          {loadError ? (
            <p className="text-[10px] leading-snug text-red-500">
              Could not load{" "}
              <span className="font-medium">{currentTrack?.filename}</span>.
            </p>
          ) : autoplayBlocked && !muted && volume > 0 ? (
            <p className="text-[10px] leading-snug text-muted-foreground">
              Tap volume to start audio.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
