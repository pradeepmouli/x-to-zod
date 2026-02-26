import type { ZodAny } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent AnyBuilder: represents z.any() schema.
 */
export class AnyBuilder extends ZodBuilder<ZodAny> {
	readonly typeKind = 'any' as const;
	constructor(version?: 'v3' | 'v4') {
		super(version);
	}
}
