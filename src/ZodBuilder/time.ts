import type { ZodStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

type TimeParams = Record<string, unknown>;

/**
 * TimeBuilder: represents z.time() in Zod v4.
 *
 * In v4, time validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().time() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const time = new TimeBuilder({ zodVersion: 'v4' });
 * time.text(); // => 'z.time()'
 *
 * // With precision
 * time.withPrecision(3).text(); // => 'z.time({ precision: 3 })'
 * ```
 */
export class TimeBuilder
	extends StringFormatBuilder<ZodStringFormat<'time'>, [params?: TimeParams]>
	implements BuilderFor<ZodStringFormat<'time'>>
{
	readonly typeKind = 'time' as const;
	private _precision?: number;

	constructor(version: 'v3' | 'v4' = 'v4', params?: TimeParams) {
		super(version, params);
	}

	/**
	 * Set precision for time validation (millisecond precision).
	 */
	withPrecision(precision: number): this {
		this._precision = precision;
		return this;
	}

	protected override base(): string {
		const currentParams = this._params?.[0];
		const mergedParams = {
			...(currentParams &&
			typeof currentParams === 'object' &&
			!Array.isArray(currentParams)
				? currentParams
				: {}),
			...(this._precision !== undefined ? { precision: this._precision } : {}),
		};
		const hasParams = Object.keys(mergedParams).length > 0;
		const paramsStr = hasParams ? JSON.stringify(mergedParams) : '';

		// In v4, use z.time() top-level function
		if (this.isV4()) {
			return hasParams ? `z.time(${paramsStr})` : 'z.time()';
		}
		// In v3, fall back to string().time()
		return hasParams ? `z.string().time(${paramsStr})` : 'z.string().time()';
	}
}
