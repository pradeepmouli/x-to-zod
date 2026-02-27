import type { z, ZodULID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type UlidParams = Parameters<typeof z.ulid>[0];

/**
 * UlidBuilder: represents z.ulid() in Zod v4.
 *
 * In v4, ULID validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().ulid() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const ulid = new UlidBuilder({ zodVersion: 'v4' });
 * ulid.text(); // => 'z.ulid()'
 * ```
 */
export class UlidBuilder
	extends StringFormatBuilder<ZodULID, [params?: Parameters<typeof z.ulid>[0]]>
	implements BuilderFor<ZodULID>
{
	readonly typeKind = 'ulid' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.ulid>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.ulid() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.ulid(${paramsStr})` : 'z.ulid()';
		}
		// In v3, fall back to string().ulid()
		return paramsStr ? `z.string().ulid(${paramsStr})` : 'z.string().ulid()';
	}
}
