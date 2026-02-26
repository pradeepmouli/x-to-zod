import type { ZodNull } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent NullBuilder: wraps a Zod null schema string and provides chainable methods.
 */
export class NullBuilder extends ZodBuilder<ZodNull> {
	readonly typeKind = 'null' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}
}
