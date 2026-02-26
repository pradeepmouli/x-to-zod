import type { z, ZodBase64 } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * Base64Builder: represents z.base64() in Zod v4.
 *
 * In v4, base64 validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().base64() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const b64 = new Base64Builder({ zodVersion: 'v4' });
 * b64.text(); // => 'z.base64()'
 * ```
 */
export class Base64Builder
	extends StringFormatBuilder<
		ZodBase64,
		[params?: Parameters<typeof z.base64>[0]]
	>
	implements BuilderFor<ZodBase64>
{
	readonly typeKind = 'base64' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.base64>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.base64() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.base64(${paramsStr})` : 'z.base64()';
		}
		// In v3, fall back to string().base64()
		return paramsStr
			? `z.string().base64(${paramsStr})`
			: 'z.string().base64()';
	}
}
