import type { ZodStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

type DurationParams = Record<string, unknown>;

/**
 * DurationBuilder: represents z.duration() in Zod v4.
 *
 * In v4, duration validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().duration() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const duration = new DurationBuilder({ zodVersion: 'v4' });
 * duration.text(); // => 'z.duration()'
 * ```
 */
export class DurationBuilder
	extends StringFormatBuilder<
		ZodStringFormat<'duration'>,
		[params?: DurationParams]
	>
	implements BuilderFor<ZodStringFormat<'duration'>>
{
	readonly typeKind = 'duration' as const;

	constructor(version: 'v3' | 'v4' = 'v4', params?: DurationParams) {
		super(version, params);
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		// In v4, use z.duration() top-level function
		if (this.isV4()) {
			return paramsStr ? `z.duration(${paramsStr})` : 'z.duration()';
		}
		// In v3, fall back to string().duration()
		return paramsStr
			? `z.string().duration(${paramsStr})`
			: 'z.string().duration()';
	}
}
