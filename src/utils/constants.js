export const GRID_SIZE = 14;
export const CELL = 1;
export const NUM_ZOMBIES = 1;
export const STEP_INTERVAL_MS = 90;
export const ZOMBIE_STEP_INTERVAL_MS = 200;
export const OBSTACLE_DENSITY = 0.3;

// Utility: clamp within [min, max]
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
