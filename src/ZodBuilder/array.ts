import type { z, ZodArray, ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

export type ArrayCreateParams = Parameters<typeof z.array>[1];
export type ArrayMinParams = Parameters<ZodArray['min']>[1];
export type ArrayMaxParams = Parameters<ZodArray['max']>[1];
export type ArrayLengthParams = Parameters<ZodArray['length']>[1];
export type ArrayNonemptyParams = Parameters<ZodArray['nonempty']>[0];

/**
 * Fluent ArrayBuilder: wraps a Zod array schema string and provides chainable methods.
 *
 * NONEMPTY() TYPE INFERENCE - Version Notes:
 * Both Zod v3 and v4 support .nonempty() with identical validation behavior.
 * However, type inference differs:
 * - .nonempty() infers [T, ...T[]] (tuple-like with at least one element)
 * - .min(1) infers T[] (regular array)
 *
 * Implementation: ArrayBuilder uses .min(1) instead of .nonempty() for:
 * 1. Consistency across versions
 * 2. Clarity in error messages
 * 3. Alignment with JSON Schema constraints (which don't express tuple constraints)
 *
 * The validation is functionally identical in both v3 and v4.
 * See ARRAY-NONEMPTY-NOTES.md for details.
 */
export class ArrayBuilder<Z extends ZodType>
	extends ZodBuilder<
		ZodArray<Z>,
		'array',
		[itemSchema: BuilderFor<Z> | BuilderFor<Z>[], params?: ArrayCreateParams]
	>
	implements BuilderFor<ZodArray>
{
	readonly typeKind = 'array' as const;
	private readonly _itemSchema: BuilderFor<Z> | BuilderFor<Z>[];
	_minItems?: { value: number; params?: ArrayMinParams } = undefined;
	_maxItems?: { value: number; params?: ArrayMaxParams } = undefined;
	_exactLength?: { value: number; params?: ArrayLengthParams } = undefined;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		itemSchema: BuilderFor<Z> | BuilderFor<Z>[],
		params?: ArrayCreateParams,
	) {
		super(version, itemSchema, params);
		this._itemSchema = itemSchema;
	}

	/**
	 * Apply minItems constraint.
	 */
	min(value: number, params?: ArrayMinParams): this {
		if (this._minItems === undefined || this._minItems.value > value) {
			this._minItems = { value, params };
		}
		return this;
	}

	/**
	 * Apply maxItems constraint.
	 */
	max(value: number, params?: ArrayMaxParams): this {
		if (this._maxItems === undefined || this._maxItems.value < value) {
			this._maxItems = { value, params };
		}
		return this;
	}

	/** Require at least one element (delegates to min(1)). */
	nonempty(params?: ArrayNonemptyParams): this {
		return this.min(1, params);
	}

	/** Require exactly `len` elements. */
	length(len: number, params?: ArrayLengthParams): this {
		this._exactLength = { value: len, params };
		return this;
	}

	unwrap(): Z {
		throw new Error('Method not implemented.');
	}

	/**
	 * Compute the base array schema.
	 */
	protected override base(): string {
		// Tuples don't support params
		if (Array.isArray(this._itemSchema)) {
			const itemStrs = this._itemSchema.map((item) => item.text());
			return `z.tuple([${itemStrs.join(',')}])`; // No space after comma
		}

		const itemStr = this._itemSchema.text();
		const arrayParams = this._params?.[1];
		const paramsStr =
			arrayParams === undefined ? '' : JSON.stringify(arrayParams);
		return paramsStr
			? `z.array(${itemStr}, ${paramsStr})`
			: `z.array(${itemStr})`;
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._exactLength !== undefined) {
			result = applyExactLength(
				result,
				this._exactLength.value,
				this._exactLength.params,
			);
		} else {
			if (this._minItems !== undefined) {
				result = applyMinItems(
					result,
					this._minItems.value,
					this._minItems.params,
				);
			}
			if (this._maxItems !== undefined) {
				result = applyMaxItems(
					result,
					this._maxItems.value,
					this._maxItems.params,
				);
			}
		}

		return super.modify(result);
	}
}

/**
 * Apply minItems constraint to an array schema.
 */
export function applyMinItems(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.min(${JSON.stringify(value)}, ${JSON.stringify(params)})`
		: `${zodStr}.min(${JSON.stringify(value)})`;
}

/**
 * Apply maxItems constraint to an array schema.
 */
export function applyMaxItems(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.max(${JSON.stringify(value)}, ${JSON.stringify(params)})`
		: `${zodStr}.max(${JSON.stringify(value)})`;
}

/**
 * Apply exact length constraint to an array schema.
 */
export function applyExactLength(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params !== undefined
		? `${zodStr}.length(${JSON.stringify(value)}, ${JSON.stringify(params)})`
		: `${zodStr}.length(${JSON.stringify(value)})`;
}
