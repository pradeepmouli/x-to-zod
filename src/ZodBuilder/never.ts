import type { ZodNever } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent NeverBuilder: represents z.never() schema.
 */
export class NeverBuilder extends ZodBuilder<ZodNever> {
	readonly typeKind = 'never' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}
}
