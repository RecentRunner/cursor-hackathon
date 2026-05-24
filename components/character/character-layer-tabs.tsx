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
      className="grid grid-cols-7 gap-0.5 border-2 border-border bg-muted/30 p-0.5"
    >
      {CHARACTER_CUSTOMIZATION_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTabId === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "min-w-0 truncate border-2 px-0.5 py-1.5 text-[7px] font-medium uppercase leading-tight tracking-wide transition-colors sm:px-1 sm:text-[8px]",
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
