import type { z, ZodNanoID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * NanoidBuilder: represents z.nanoid() in Zod v4.
 *
 * In v4, Nano ID validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().nanoid() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const nanoid = new NanoidBuilder({ zodVersion: 'v4' });
 * nanoid.text(); // => 'z.nanoid()'
 * ```
 */
export class NanoidBuilder
	extends StringFormatBuilder<
		ZodNanoID,
		[params?: Parameters<typeof z.nanoid>[0]]
	>
	implements BuilderFor<ZodNanoID>
{
	readonly typeKind = 'nanoid' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.nanoid>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.nanoid() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.nanoid(${paramsStr})` : 'z.nanoid()';
		}
		// In v3, fall back to string().nanoid()
		return paramsStr
			? `z.string().nanoid(${paramsStr})`
			: 'z.string().nanoid()';
	}
}
