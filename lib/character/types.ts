import type { HSL } from "./color-utils";
import type { CharacterLayerId } from "./presets";

export type LayerColorState = Record<CharacterLayerId, HSL>;
export type LayerVariantState = Record<CharacterLayerId, string>;
