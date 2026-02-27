import type { z, ZodUUID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type UuidParams =
	| Parameters<typeof z.uuid>[0]
	| Parameters<typeof z.guid>[0]
	| Parameters<typeof z.uuidv6>[0]
	| Parameters<typeof z.uuidv7>[0];

/**
 * UuidBuilder: represents z.uuid() or z.guid() in Zod v4.
 *
 * In v4, UUID/GUID validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().uuid() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode - UUID
 * const uuid = new UuidBuilder('uuid', { zodVersion: 'v4' });
 * uuid.text(); // => 'z.uuid()'
 *
 * // v4 mode - GUID (alias)
 * const guid = new UuidBuilder('guid', { zodVersion: 'v4' });
 * guid.text(); // => 'z.guid()'
 * ```
 */
export class UuidBuilder
	extends StringFormatBuilder<ZodUUID, [params?: UuidParams]>
	implements BuilderFor<ZodUUID>
{
	readonly typeKind = 'uuid' as const;
	private _variant: 'uuid' | 'guid';

	constructor(
		version: 'v3' | 'v4' = 'v4',
		variant: 'uuid' | 'guid' = 'uuid',
		params?: UuidParams,
	) {
		super(version, params);
		this._variant = variant;
	}

	protected override base(): string {
		const method = this._variant; // 'uuid' or 'guid'
		const paramsStr = this.serializeParams();

		// In v4, use z.uuid() or z.guid() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.${method}(${paramsStr})` : `z.${method}()`;
		}
		// In v3, fall back to string().uuid() or string().guid()
		return paramsStr
			? `z.string().${method}(${paramsStr})`
			: `z.string().${method}()`;
	}
}
