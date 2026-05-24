"use client";

import { SkipForward, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AVATAR_AMBIENT_PLAYLIST,
  getAvatarAmbientTrackSrc,
  getAvatarAudioPreferences,
  setAvatarAudioPreferences,
} from "@/lib/avatar-audio";
import { cn } from "@/lib/utils";

type AvatarAmbientAudioProps = {
  className?: string;
};

export function AvatarAmbientAudio({ className }: AvatarAmbientAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(0.6);
  const mutedRef = useRef(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const currentTrack = AVATAR_AMBIENT_PLAYLIST[trackIndex];
  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const preferences = getAvatarAudioPreferences();
    setVolume(preferences.volume);
    setMuted(preferences.muted);
    volumeRef.current = preferences.volume;
    mutedRef.current = preferences.muted;
  }, []);

  const persistPreferences = useCallback(
    (nextVolume: number, nextMuted: boolean) => {
      setAvatarAudioPreferences({ volume: nextVolume, muted: nextMuted });
    },
    [],
  );

  const applyVolume = useCallback(async (nextVolume: number) => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = nextVolume;

    if (nextVolume === 0) {
      audio.pause();
      return;
    }

    if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    try {
      await audio.play();
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }, []);

  const loadTrack = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      const track = AVATAR_AMBIENT_PLAYLIST[index];

      if (!audio || !track) {
        return;
      }

      setLoadError(false);
      audio.src = getAvatarAmbientTrackSrc(track.filename);

      const handleCanPlay = () => {
        const nextVolume = mutedRef.current ? 0 : volumeRef.current;
        void applyVolume(nextVolume);
      };

      const handleError = () => {
        setLoadError(true);
      };

      audio.addEventListener("canplay", handleCanPlay, { once: true });
      audio.addEventListener("error", handleError, { once: true });
      audio.load();
    },
    [applyVolume],
  );

  useEffect(() => {
    loadTrack(trackIndex);
  }, [loadTrack, trackIndex]);

  useEffect(() => {
    void applyVolume(effectiveVolume);
  }, [applyVolume, effectiveVolume]);

  useEffect(() => {
    persistPreferences(volume, muted);
  }, [volume, muted, persistPreferences]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleEnded = () => {
      setTrackIndex((current) => (current + 1) % AVATAR_AMBIENT_PLAYLIST.length);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const handleToggleMute = () => {
    setMuted((current) => !current);
  };

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);

    if (nextVolume > 0 && muted) {
      setMuted(false);
    }

    if (nextVolume === 0) {
      setMuted(true);
    }
  };

  const handleSkip = () => {
    setTrackIndex((current) => (current + 1) % AVATAR_AMBIENT_PLAYLIST.length);
  };

  const handleUserActivate = () => {
    void applyVolume(effectiveVolume);
  };

  return (
    <div
      className={cn(
        "fixed right-4 z-30 flex max-w-[min(100vw-2rem,18rem)] flex-col gap-2 border-2 border-border bg-background/95 p-3 shadow-[var(--retro-shadow-sm)] backdrop-blur-sm",
        className,
      )}
      style={{
        top: "calc(var(--app-topbar-height) + env(safe-area-inset-top, 0px) + 0.75rem)",
      }}
      onPointerDown={handleUserActivate}
    >
      <audio ref={audioRef} preload="auto" />

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Label
            htmlFor="avatar-ambient-volume"
            className="font-pixel text-[8px] uppercase tracking-wide text-muted-foreground"
          >
            Ambient
          </Label>
          <p className="truncate text-[10px] text-foreground">
            {currentTrack?.label ?? "Track"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Skip to next track"
            onClick={handleSkip}
          >
            <SkipForward aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label={
              muted || volume === 0 ? "Unmute ambient audio" : "Mute ambient audio"
            }
            aria-pressed={muted || volume === 0}
            onClick={handleToggleMute}
          >
            {muted || volume === 0 ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
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
        className="w-full accent-primary"
      />

      <p className="text-[10px] leading-snug text-muted-foreground">
        Track {trackIndex + 1} of {AVATAR_AMBIENT_PLAYLIST.length}
      </p>

      {loadError ? (
        <p className="text-[10px] leading-snug text-red-500">
          Could not load{" "}
          <span className="font-medium">{currentTrack?.filename}</span>.
        </p>
      ) : autoplayBlocked && effectiveVolume > 0 ? (
        <p className="text-[10px] leading-snug text-muted-foreground">
          Tap volume to start audio.
        </p>
      ) : null}
    </div>
  );
}
