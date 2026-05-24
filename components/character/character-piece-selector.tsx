"use client";

import { CircleSlash, Lock } from "lucide-react";

import type { HSL } from "@/lib/character/color-utils";
import { NONE_VARIANT_ID, PIECE_SLOT_COUNT } from "@/lib/character/presets";
import { cn } from "@/lib/utils";
import type { LayerVariant } from "@/lib/character/presets";

import { TintedSpriteIcon } from "./tinted-sprite-icon";

type CharacterPieceSelectorProps = {
  variants: LayerVariant[];
  lockedVariantIds?: ReadonlySet<string>;
  activeId: string;
  color: HSL;
  skinColor?: HSL;
  onSelect: (variantId: string) => void;
  onLockedSelect?: (variantId: string) => void;
};

export function CharacterPieceSelector({
  variants,
  lockedVariantIds,
  activeId,
  color,
  skinColor,
  onSelect,
  onLockedSelect,
}: CharacterPieceSelectorProps) {
  const slots = Array.from({ length: PIECE_SLOT_COUNT }, (_, index) =>
    variants[index] ?? null,
  );

  return (
    <div className="grid grid-cols-8 gap-2">
      {slots.map((variant, index) => {
        if (!variant) {
          return (
            <div
              key={`empty-${index}`}
              aria-hidden
              className="size-14 rounded-lg border border-dashed border-border/50 bg-muted/15"
            />
          );
        }

        if (variant.id === NONE_VARIANT_ID) {
          return (
            <button
              key={variant.id}
              type="button"
              title={variant.label}
              aria-label={variant.label}
              aria-pressed={activeId === variant.id}
              onClick={() => onSelect(variant.id)}
              className={cn(
                "flex size-14 items-center justify-center rounded-lg border bg-muted/20 transition-colors",
                activeId === variant.id
                  ? "border-foreground bg-muted/35 shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.15)]"
                  : "border-border/60 hover:border-border hover:bg-muted/30",
              )}
            >
              <CircleSlash
                className="size-6 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
            </button>
          );
        }

        const locked = lockedVariantIds?.has(variant.id) ?? false;

        return (
          <button
            key={variant.id}
            type="button"
            title={
              locked ? `${variant.label} — preview in shop` : variant.label
            }
            aria-label={
              locked ? `${variant.label}, locked — preview to unlock` : variant.label
            }
            aria-pressed={activeId === variant.id}
            onClick={() => {
              if (locked) {
                onLockedSelect?.(variant.id);
                return;
              }

              onSelect(variant.id);
            }}
            className={cn(
              "relative flex size-14 items-center justify-center rounded-lg border bg-zinc-950/80 p-1.5 transition-colors",
              locked
                ? "border-border/40 hover:border-border hover:bg-zinc-900/60"
                : activeId === variant.id
                  ? "border-foreground bg-zinc-900 shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.15)]"
                  : "border-border/60 hover:border-border hover:bg-zinc-900/60",
            )}
          >
            <TintedSpriteIcon
              src={variant.src}
              color={color}
              skinColor={skinColor}
              size={36}
            />
            {locked ? (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center rounded-lg"
              >
                <span className="rounded bg-black/50 p-1">
                  <Lock className="size-4 text-white" strokeWidth={2.25} />
                </span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
