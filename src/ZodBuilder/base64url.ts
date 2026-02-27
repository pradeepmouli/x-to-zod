import type { z, ZodBase64URL } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type Base64UrlParams = Parameters<typeof z.base64url>[0];

/**
 * Base64UrlBuilder: represents z.base64url() in Zod v4.
 */
export class Base64UrlBuilder
	extends StringFormatBuilder<ZodBase64URL>
	implements BuilderFor<ZodBase64URL>
{
	readonly typeKind = 'base64url' as const;

	constructor(
		version?: 'v3' | 'v4',
		params?: Parameters<typeof z.base64url>[0],
	) {
		super(version, params);
	}
}
