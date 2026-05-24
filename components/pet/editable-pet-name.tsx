"use client";

import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  DEFAULT_AVATAR_NAME,
  saveAvatarName,
} from "@/lib/avatar-customization-storage";
import { cn } from "@/lib/utils";

type EditablePetNameProps = {
  name: string;
  moodLabel?: string;
  editable?: boolean;
  onNameChange?: (name: string) => void;
  /** Frame header above LCD, or floating badge inside the LCD viewport. */
  variant?: "frame" | "overlay";
  size?: "default" | "landing";
  className?: string;
};

export function EditablePetName({
  name,
  moodLabel,
  editable = true,
  onNameChange,
  variant = "frame",
  size = "default",
  className,
}: EditablePetNameProps) {
  const [displayName, setDisplayName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOverlay = variant === "overlay";

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

  const beginEdit = () => {
    if (!editable || isSaving) {
      return;
    }

    setDraft(displayName);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(displayName);
    setError(null);
    setIsEditing(false);
  };

  const saveName = async () => {
    const trimmed = draft.trim() || DEFAULT_AVATAR_NAME;

    if (trimmed === displayName) {
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
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save bit name.",
      );
      setDraft(displayName);
    } finally {
      setIsSaving(false);
    }
  };

  const overlayNameClass =
    size === "landing"
      ? "lcd-readable-name lcd-readable-name-landing"
      : cn(
          "lcd-readable-name text-sm sm:text-base md:text-lg",
        );

  const editInput = (
    <div className={cn(isOverlay ? "space-y-1" : "space-y-2")}>
      <Input
        ref={inputRef}
        value={draft}
        maxLength={32}
        disabled={isSaving}
        aria-label="Bit name"
        className={cn(
          "font-pixel",
          isOverlay
            ? cn("h-8 min-w-[6rem] px-2 py-1 text-sm", overlayNameClass)
            : "h-9 text-base",
        )}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void saveName();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancelEdit();
          }
        }}
        onBlur={() => {
          void saveName();
        }}
        onClick={(event) => event.stopPropagation()}
      />
      {error ? (
        <p
          className={cn(
            "text-red-500",
            isOverlay ? "text-[10px]" : "text-xs",
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );

  const displayRow = editable ? (
    <div
      className={cn(
        "flex items-center gap-1",
        isOverlay && cn("max-w-full", overlayNameClass),
        !isOverlay &&
          "group min-w-0 flex-1 items-center gap-2 border-2 border-border bg-card/80 px-3 py-2 shadow-[var(--retro-shadow-sm)]",
      )}
    >
      {isOverlay ? (
        <span className="min-w-0 truncate font-pixel leading-snug">
          {displayName}
        </span>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            beginEdit();
          }}
          className={cn(
            "group flex min-w-0 flex-1 items-center gap-2 text-left transition-colors",
            "hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
          aria-label={`Edit name: ${displayName}`}
        >
          <span className="min-w-0 flex-1 truncate font-pixel text-base leading-snug text-foreground">
            {displayName}
          </span>
          <Pencil
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
            strokeWidth={2.5}
          />
        </button>
      )}
      {isOverlay ? (
        <button
          type="button"
          aria-label="Edit bit name"
          title="Edit bit name"
          disabled={isSaving}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            beginEdit();
          }}
          className="flex shrink-0 items-center justify-center p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil aria-hidden="true" className="size-3" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  ) : (
    <p
      className={cn(
        "min-w-0 truncate font-pixel leading-snug text-foreground",
        !isOverlay && "flex-1 text-base",
        isOverlay && overlayNameClass,
      )}
    >
      {displayName}
    </p>
  );

  return (
    <div
      className={cn(
        isOverlay
          ? "absolute right-2 top-2 z-20 max-w-[58%]"
          : "mb-3 shrink-0 border-b-2 border-border/60 pb-3",
        className,
      )}
      onClick={(event) => {
        if (isEditing) {
          event.stopPropagation();
        }
      }}
    >
      {isEditing ? editInput : displayRow}

      {!isOverlay && moodLabel ? (
        <p className="mt-1.5 text-xs uppercase tracking-[0.2em] text-secondary">
          {moodLabel}
        </p>
      ) : null}
    </div>
  );
}
