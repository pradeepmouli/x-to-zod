import type { z, ZodCustomStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type HexParams = Parameters<typeof z.hex>[0];

/**
 * HexBuilder: represents z.hex() in Zod v4.
 */
export class HexBuilder
	extends StringFormatBuilder<ZodCustomStringFormat<'hex'>>
	implements BuilderFor<ZodCustomStringFormat<'hex'>>
{
	readonly typeKind = 'hex' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.hex>[0]) {
		super(version, params);
	}
}
