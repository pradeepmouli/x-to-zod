/**
 * Version-specific type definitions for Zod builders.
 *
 * Single source of truth: BuildV3 and BuildV4 are defined in their
 * respective factory files (v3.ts, v4.ts) with concrete return types.
 * V3BuildAPI / V4BuildAPI are aliases used by the versioned entry points.
 */

export type { BuildV3 as V3BuildAPI } from './v3.js';
export type { BuildV4 as V4BuildAPI } from './v4.js';
