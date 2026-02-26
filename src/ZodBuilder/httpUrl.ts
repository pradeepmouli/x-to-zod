import type { ZodURL } from 'zod';
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

	constructor(version?: 'v3' | 'v4') {
		super(version);
	}

	protected override base(): string {
		return 'z.httpUrl()';
	}
}
