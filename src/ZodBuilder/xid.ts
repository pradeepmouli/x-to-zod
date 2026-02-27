import type { z, ZodXID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type XidParams = Parameters<typeof z.xid>[0];

/**
 * XidBuilder: represents z.xid() in Zod v4.
 */
export class XidBuilder
	extends StringFormatBuilder<ZodXID>
	implements BuilderFor<ZodXID>
{
	readonly typeKind = 'xid' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.xid>[0]) {
		super(version, params);
	}
}
