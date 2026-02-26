import type { ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * JsonBuilder: represents z.json()
 * Validates JSON-encoded strings
 */
export class JsonBuilder
	extends ZodBuilder<ZodType>
	implements BuilderFor<ZodType>
{
	readonly typeKind = 'lazy' as const;

	protected override base(): string {
		return 'z.json()';
	}
}
