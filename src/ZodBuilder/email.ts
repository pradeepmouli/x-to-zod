import type { z, ZodEmail } from 'zod';
import { StringFormatBuilder } from './StringFormatBuilder.js';
import type { BuilderFor } from '../Builder/index.js';

export type EmailParams = Parameters<typeof z.email>[0];

/**
 * EmailBuilder: represents z.email() in Zod v4.
 *
 * In v4, email validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().email() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const email = new EmailBuilder({ zodVersion: 'v4' });
 * email.text(); // => 'z.email()'
 *
 * // With error message
 * email.text('Invalid email'); // => 'z.email({ error: "Invalid email" })'
 * ```
 */
export class EmailBuilder
	extends StringFormatBuilder<
		ZodEmail,
		[params?: Parameters<typeof z.email>[0]]
	>
	implements BuilderFor<ZodEmail>
{
	readonly typeKind = 'email' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.email>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.email() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.email(${paramsStr})` : 'z.email()';
		}
		// In v3, fall back to string().email()
		return paramsStr ? `z.string().email(${paramsStr})` : 'z.string().email()';
	}
}
