"use client";

import {
  CHARACTER_CUSTOMIZATION_TABS,
  type CharacterCreatorTabId,
} from "@/lib/character/presets";
import { cn } from "@/lib/utils";

type CharacterLayerTabsProps = {
  activeTabId: CharacterCreatorTabId;
  onTabChange: (tabId: CharacterCreatorTabId) => void;
};

export function CharacterLayerTabs({
  activeTabId,
  onTabChange,
}: CharacterLayerTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Character customization"
      className="grid grid-cols-4 gap-1 border-2 border-border bg-muted/30 p-1 sm:grid-cols-7"
    >
      {CHARACTER_CUSTOMIZATION_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTabId === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "min-w-0 border-2 px-1 py-2 text-[10px] font-semibold uppercase leading-tight tracking-wide transition-colors sm:px-1.5 sm:text-xs",
            activeTabId === tab.id
              ? "border-secondary bg-background text-foreground shadow-[var(--retro-shadow-sm)]"
              : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
