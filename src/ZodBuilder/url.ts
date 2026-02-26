import type { z, ZodURL } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * UrlBuilder: represents z.url() in Zod v4.
 *
 * In v4, URL validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().url() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const url = new UrlBuilder({ zodVersion: 'v4' });
 * url.text(); // => 'z.url()'
 *
 * // With error message
 * url.text('Invalid URL'); // => 'z.url({ error: "Invalid URL" })'
 * ```
 */
export class UrlBuilder
	extends StringFormatBuilder<ZodURL, [params?: Parameters<typeof z.url>[0]]>
	implements BuilderFor<ZodURL>
{
	readonly typeKind = 'url' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.url>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.url() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.url(${paramsStr})` : 'z.url()';
		}
		// In v3, fall back to string().url()
		return paramsStr ? `z.string().url(${paramsStr})` : 'z.string().url()';
	}
}
