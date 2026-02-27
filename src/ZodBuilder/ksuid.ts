import type { z, ZodKSUID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * KsuidBuilder: represents z.ksuid() in Zod v4.
 */
export class KsuidBuilder
	extends StringFormatBuilder<ZodKSUID>
	implements BuilderFor<ZodKSUID>
{
	readonly typeKind = 'ksuid' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.ksuid>[0]) {
		super(version, params);
	}
}
