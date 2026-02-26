import type { ZodStringFormat } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { StringFormatBuilder } from './StringFormatBuilder.js';

type DatetimeParams = Record<string, unknown>;

/**
 * DatetimeBuilder: represents z.datetime() in Zod v4.
 *
 * In v4, datetime validation is a top-level function that provides better type inference
 * and tree-shaking compared to v3's z.string().datetime() method chain.
 *
 * @example
 * ```typescript
 * // v4 mode
 * const dt = new DatetimeBuilder({ zodVersion: 'v4' });
 * dt.text(); // => 'z.datetime()'
 *
 * // With precision
 * dt.withPrecision(3).text(); // => 'z.datetime({ precision: 3 })'
 * ```
 */
export class DatetimeBuilder
	extends StringFormatBuilder<
		ZodStringFormat<'datetime'>,
		[params?: DatetimeParams]
	>
	implements BuilderFor<ZodStringFormat<'datetime'>>
{
	readonly typeKind = 'datetime' as const;
	private _precision?: number;
	private _offset?: boolean;

	constructor(version: 'v3' | 'v4' = 'v4', params?: DatetimeParams) {
		super(version, params);
	}

	/**
	 * Set precision for datetime validation (millisecond precision).
	 */
	withPrecision(precision: number): this {
		this._precision = precision;
		return this;
	}

	/**
	 * Require timezone offset in datetime string.
	 */
	withOffset(required: boolean = true): this {
		this._offset = required;
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
			...(this._offset !== undefined ? { offset: this._offset } : {}),
		};
		const hasParams = Object.keys(mergedParams).length > 0;
		const paramsStr = hasParams ? JSON.stringify(mergedParams) : '';

		// In v4, use z.datetime() top-level function
		if (this.isV4()) {
			return hasParams ? `z.datetime(${paramsStr})` : 'z.datetime()';
		}
		// In v3, fall back to string().datetime()
		return hasParams
			? `z.string().datetime(${paramsStr})`
			: 'z.string().datetime()';
	}
}
