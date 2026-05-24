"use client";

import { cn } from "@/lib/utils";
import type { ColorPreset } from "@/lib/character/presets";

type CharacterColorPresetsProps = {
  presets: ColorPreset[];
  activeId?: string;
  onSelect: (preset: ColorPreset) => void;
};

export function CharacterColorPresets({
  presets,
  activeId,
  onSelect,
}: CharacterColorPresetsProps) {
  return (
    <div className="grid grid-cols-9 gap-2">
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          title={preset.name}
          aria-label={preset.name}
          aria-pressed={activeId === preset.id}
          onClick={() => onSelect(preset)}
          className={cn(
            "aspect-square size-full max-h-9 max-w-9 rounded-md border transition-colors",
            activeId === preset.id
              ? "border-foreground ring-1 ring-foreground/40 ring-offset-1 ring-offset-background"
              : "border-border/60 hover:border-border",
          )}
          style={{ backgroundColor: preset.hex }}
        />
      ))}
    </div>
  );
}
