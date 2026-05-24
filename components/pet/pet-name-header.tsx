"use client";

import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  DEFAULT_AVATAR_NAME,
  saveAvatarName,
} from "@/lib/avatar-customization-storage";
import { cn } from "@/lib/utils";

type PetNameHeaderProps = {
  name: string;
  moodLabel: string;
  editable?: boolean;
  onNameChange?: (name: string) => void;
  className?: string;
};

export function PetNameHeader({
  name,
  moodLabel,
  editable = true,
  onNameChange,
  className,
}: PetNameHeaderProps) {
  const [displayName, setDisplayName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(name);
    if (!isEditing) {
      setDraft(name);
    }
  }, [name, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (!editable || isSaving) {
      return;
    }

    setDraft(displayName);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(displayName);
    setError(null);
    setIsEditing(false);
  };

  const commitName = async () => {
    const trimmed = draft.trim() || DEFAULT_AVATAR_NAME;

    if (trimmed === displayName) {
      setIsEditing(false);
      return;
    }

    if (!editable) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveAvatarName(trimmed);
      setDisplayName(saved);
      onNameChange?.(saved);
      setIsEditing(false);
    } catch (commitError) {
      setError(
        commitError instanceof Error
          ? commitError.message
          : "Could not save bit name.",
      );
      setDraft(displayName);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn("mb-3 shrink-0 border-b-2 border-border/60 pb-3", className)}
      onClick={(event) => {
        if (isEditing) {
          event.stopPropagation();
        }
      }}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Input
            ref={inputRef}
            value={draft}
            maxLength={32}
            disabled={isSaving}
            aria-label="Bit name"
            className="h-9 font-pixel text-base"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void commitName();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            onBlur={() => {
              void commitName();
            }}
          />
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 font-pixel text-base leading-snug text-foreground">
            {displayName}
          </p>
          {editable ? (
            <button
              type="button"
              aria-label="Edit bit name"
              title="Edit bit name"
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                startEditing();
              }}
              className="flex shrink-0 items-center justify-center border-2 border-border bg-card/80 p-1.5 text-muted-foreground shadow-[var(--retro-shadow-sm)] transition-colors hover:border-primary/60 hover:text-foreground"
            >
              <Pencil
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2.5}
              />
            </button>
          ) : null}
        </div>
      )}
      <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-secondary">
        {moodLabel}
      </p>
    </div>
  );
}
