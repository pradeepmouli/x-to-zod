import type { z, ZodURL } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

/**
 * HttpUrlBuilder: represents z.httpUrl() in Zod v4.
 * Similar to UrlBuilder but restricts to HTTP/HTTPS protocols.
 */
export class HttpUrlBuilder
	extends StringFormatBuilder<ZodURL>
	implements BuilderFor<ZodURL>
{
	readonly typeKind = 'url' as const;

	constructor(version?: 'v3' | 'v4', params?: Parameters<typeof z.httpUrl>[0]) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.httpUrl(${paramsStr})` : 'z.httpUrl()';
	}
}
