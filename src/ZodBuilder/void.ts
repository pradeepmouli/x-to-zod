import type { ZodVoid } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * VoidBuilder: represents z.void()
 */
export class VoidBuilder extends ZodBuilder<ZodVoid> {
	readonly typeKind = 'void' as const;
}
