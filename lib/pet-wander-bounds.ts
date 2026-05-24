/** Percentage bounds for pet wander within the LCD viewport. */
export const PET_WANDER_BOUNDS = {
  /** Horizontal inset — keep pet off side walls */
  minX: 15,
  maxX: 85,
  /** Lower third of LCD — ground where hills/grass/floor render */
  minY: 66,
  maxY: 90,
} as const;

export const PET_WANDER_START = {
  x: 50,
  y: 78,
} as const;
