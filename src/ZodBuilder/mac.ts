import type { ZodMAC } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * MacBuilder: represents z.mac() in Zod v4.
 */
export class MacBuilder
	extends StringFormatBuilder<ZodMAC>
	implements BuilderFor<ZodMAC>
{
	readonly typeKind = 'mac' as const;

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}
}
