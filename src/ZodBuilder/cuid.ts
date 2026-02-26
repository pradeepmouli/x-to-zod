import type { z, ZodCUID } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

type CuidParams = Parameters<typeof z.cuid>[0] | Parameters<typeof z.cuid2>[0];

/**
 * CuidBuilder: represents z.cuid() or z.cuid2() in Zod v4.
 *
 * In v4, CUID validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().cuid() method chain.
 *
 * Supports both cuid (v1) and cuid2 (v2) variants.
 *
 * @example
 * ```typescript
 * // v4 mode - CUID v1
 * const cuid = new CuidBuilder('cuid', { zodVersion: 'v4' });
 * cuid.text(); // => 'z.cuid()'
 *
 * // v4 mode - CUID v2
 * const cuid2 = new CuidBuilder('cuid2', { zodVersion: 'v4' });
 * cuid2.text(); // => 'z.cuid2()'
 * ```
 */
export class CuidBuilder
	extends StringFormatBuilder<ZodCUID, [params?: CuidParams]>
	implements BuilderFor<ZodCUID>
{
	readonly typeKind = 'cuid' as const;
	private _variant: 'cuid' | 'cuid2';

	constructor(
		version: 'v3' | 'v4' = 'v4',
		variant: 'cuid' | 'cuid2' = 'cuid',
		params?: CuidParams,
	) {
		super(version, params);
		this._variant = variant;
	}

	protected override base(): string {
		const method = this._variant; // 'cuid' or 'cuid2'
		const paramsStr = this.serializeParams();

		// In v4, use z.cuid() or z.cuid2() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.${method}(${paramsStr})` : `z.${method}()`;
		}
		// In v3, fall back to string().cuid() or string().cuid2()
		return paramsStr
			? `z.string().${method}(${paramsStr})`
			: `z.string().${method}()`;
	}
}
