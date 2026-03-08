/**
 * Zod v4 specific entry point
 *
 * Import from 'x-to-zod/v4' to get:
 * - build object with full v4 API including v4-only methods
 * - TypeScript types enforce full v4 API surface
 *
 * Note: This provides the full v4 API surface but does not automatically set
 * zodVersion option. When using jsonSchemaToZod or other functions that
 * accept a zodVersion option, you still need to pass it explicitly.
 *
 * @example
 * ```typescript
 * import { build } from 'x-to-zod/v4';
 *
 * // All builders available including v4-only features
 * const schema = build.string();
 * const promiseSchema = build.promise(build.string());
 * const lazySchema = build.lazy('() => mySchema');
 * ```
 */

import { buildV4 } from './ZodBuilder/index.js';
import type { V4BuildAPI } from './ZodBuilder/versions.js';

// Re-export everything from the main entry point
export * from './index.js';
export { toZod as default } from './JsonSchema/toZod.js';

// Export build with v4 type signature (full API)
export const build: V4BuildAPI = buildV4 as V4BuildAPI;
