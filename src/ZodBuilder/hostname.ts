import type { z, ZodCustomStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * HostnameBuilder: represents z.hostname() in Zod v4.
 */
export class HostnameBuilder
	extends StringFormatBuilder<ZodCustomStringFormat<'hostname'>>
	implements BuilderFor<ZodCustomStringFormat<'hostname'>>
{
	readonly typeKind = 'hostname' as const;

	constructor(
		version?: 'v3' | 'v4',
		params?: Parameters<typeof z.hostname>[0],
	) {
		super(version, params);
	}
}
