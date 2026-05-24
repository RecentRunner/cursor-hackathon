"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AmbientAudioPanel } from "@/components/layout/ambient-audio-panel";
import { HABIT_PET_DATA_UPDATED_EVENT } from "@/lib/app-events";
import {
  AVATAR_AMBIENT_PLAYLIST,
  getAvatarAmbientTrackSrc,
  getAvatarAudioPreferences,
  setAvatarAudioPreferences,
  type AvatarAmbientTrack,
} from "@/lib/avatar-audio";
import { getOnboardingStatusClient } from "@/lib/onboarding-status";
import { createClient } from "@/lib/supabase/client";

type AmbientAudioContextValue = {
  enabled: boolean;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  volume: number;
  muted: boolean;
  trackIndex: number;
  currentTrack: AvatarAmbientTrack | undefined;
  autoplayBlocked: boolean;
  loadError: boolean;
  isPlaying: boolean;
  handleToggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
  handleSkip: () => void;
  handleUserActivate: () => void;
};

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

export function useAmbientAudio() {
  const context = useContext(AmbientAudioContext);

  if (!context) {
    throw new Error("useAmbientAudio must be used within AmbientAudioProvider.");
  }

  return context;
}

export function useAmbientAudioOptional() {
  return useContext(AmbientAudioContext);
}

type AmbientAudioProviderProps = {
  children: ReactNode;
};

export function AmbientAudioProvider({ children }: AmbientAudioProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(0.6);
  const mutedRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = AVATAR_AMBIENT_PLAYLIST[trackIndex];
  const effectiveVolume = muted ? 0 : volume;

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const supabase = createClient();

    async function syncAudioState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setEnabled(false);
        setPanelOpen(false);
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

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const preferences = getAvatarAudioPreferences();
    setVolume(preferences.volume);
    setMuted(preferences.muted);
    volumeRef.current = preferences.volume;
    mutedRef.current = preferences.muted;
  }, [enabled]);

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
      setIsPlaying(false);
      return;
    }

    if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    try {
      await audio.play();
      setAutoplayBlocked(false);
      setIsPlaying(true);
    } catch {
      setAutoplayBlocked(true);
      setIsPlaying(false);
    }
  }, []);

  const loadTrack = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      const track = AVATAR_AMBIENT_PLAYLIST[index];

      if (!audio || !track || !enabled) {
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
        setIsPlaying(false);
      };

      audio.addEventListener("canplay", handleCanPlay, { once: true });
      audio.addEventListener("error", handleError, { once: true });
      audio.load();
    },
    [applyVolume, enabled],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    loadTrack(trackIndex);
  }, [enabled, loadTrack, trackIndex]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void applyVolume(effectiveVolume);
  }, [applyVolume, effectiveVolume, enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    persistPreferences(volume, muted);
  }, [enabled, volume, muted, persistPreferences]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !enabled) {
      return;
    }

    const handleEnded = () => {
      setTrackIndex((current) => (current + 1) % AVATAR_AMBIENT_PLAYLIST.length);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, [enabled]);

  useEffect(() => {
    if (!panelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelOpen]);

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

  const togglePanel = () => {
    setPanelOpen((current) => !current);
  };

  const contextValue: AmbientAudioContextValue = {
    enabled,
    panelOpen,
    setPanelOpen,
    togglePanel,
    volume,
    muted,
    trackIndex,
    currentTrack,
    autoplayBlocked,
    loadError,
    isPlaying,
    handleToggleMute,
    handleVolumeChange,
    handleSkip,
    handleUserActivate,
  };

  return (
    <AmbientAudioContext.Provider value={contextValue}>
      {children}
      {enabled ? (
        <>
          <audio ref={audioRef} preload="auto" className="hidden" />
          <AmbientAudioPanel />
        </>
      ) : null}
    </AmbientAudioContext.Provider>
  );
}
