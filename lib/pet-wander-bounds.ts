/** Ground band height as a fraction of the LCD — matches room PNG floor (~bottom 22%). */
export const PET_GROUND_ZONE_HEIGHT_RATIO = 0.22;

/** Wander bounds inside the ground zone (not the full LCD). */
export const PET_WANDER_BOUNDS = {
  /** Horizontal inset — keep pet off side walls */
  minX: 15,
  maxX: 85,
  /** Vertical offset from floor, as % of ground zone height (0 = feet on floor) */
  minY: 0,
  maxY: 65,
} as const;

export const PET_WANDER_START = {
  x: 50,
  y: 12,
} as const;
