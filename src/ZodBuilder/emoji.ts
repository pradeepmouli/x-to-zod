import type { z, ZodEmoji } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

export type EmojiParams = Parameters<typeof z.emoji>[0];

/**
 * EmojiBuilder: represents z.emoji() in Zod v4.
 *
 * In v4, emoji validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().emoji() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const emoji = new EmojiBuilder({ zodVersion: 'v4' });
 * emoji.text(); // => 'z.emoji()'
 * ```
 */
export class EmojiBuilder
	extends StringFormatBuilder<
		ZodEmoji,
		[params?: Parameters<typeof z.emoji>[0]]
	>
	implements BuilderFor<ZodEmoji>
{
	readonly typeKind = 'emoji' as const;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		params?: Parameters<typeof z.emoji>[0],
	) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.emoji() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.emoji(${paramsStr})` : 'z.emoji()';
		}
		// In v3, fall back to string().emoji()
		return paramsStr ? `z.string().emoji(${paramsStr})` : 'z.string().emoji()';
	}
}
