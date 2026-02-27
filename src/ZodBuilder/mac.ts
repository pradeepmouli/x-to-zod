import type { z, ZodMAC } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type MacParams = Parameters<typeof z.mac>[0];

/**
 * MacBuilder: represents z.mac() in Zod v4.
 */
export class MacBuilder
	extends StringFormatBuilder<ZodMAC>
	implements BuilderFor<ZodMAC>
{
	readonly typeKind = 'mac' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.mac>[0]) {
		super(version, params);
	}
}
