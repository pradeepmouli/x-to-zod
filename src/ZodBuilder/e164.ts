import type { z, ZodE164 } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * E164Builder: represents z.e164() in Zod v4.
 */
export class E164Builder
	extends StringFormatBuilder<ZodE164>
	implements BuilderFor<ZodE164>
{
	readonly typeKind = 'e164' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.e164>[0]) {
		super(version, params);
	}
}
