import type { ZodUndefined } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * UndefinedBuilder: represents z.undefined()
 */
export class UndefinedBuilder extends ZodBuilder<ZodUndefined> {
	readonly typeKind = 'undefined' as const;
}
