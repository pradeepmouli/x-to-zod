import type { ZodNaN } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * NaNBuilder: represents z.nan()
 */
export class NaNBuilder extends ZodBuilder<ZodNaN> {
	readonly typeKind = 'nan' as const;
}
