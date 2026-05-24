"use client";

import { CHARACTER_LAYERS, type CharacterLayerId } from "@/lib/character/presets";
import { cn } from "@/lib/utils";

type CharacterLayerTabsProps = {
  activeLayerId: CharacterLayerId;
  onLayerChange: (layerId: CharacterLayerId) => void;
};

export function CharacterLayerTabs({
  activeLayerId,
  onLayerChange,
}: CharacterLayerTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Character layers"
      className="flex gap-0.5 overflow-x-auto rounded-lg border bg-muted/30 p-1"
    >
      {CHARACTER_LAYERS.map((layer) => (
        <button
          key={layer.id}
          type="button"
          role="tab"
          aria-selected={activeLayerId === layer.id}
          onClick={() => onLayerChange(layer.id)}
          className={cn(
            "min-w-[4.5rem] flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeLayerId === layer.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {layer.label}
        </button>
      ))}
    </div>
  );
}
