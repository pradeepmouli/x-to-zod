import type { ZodSet } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * SetBuilder: represents z.set() with optional constraints
 */
export class SetBuilder extends ZodBuilder<
	ZodSet,
	'set',
	[itemSchema: Builder]
> {
	readonly typeKind = 'set' as const;
	_itemSchema: Builder;
	_min?: { value: number; params?: unknown } = undefined;
	_max?: { value: number; params?: unknown } = undefined;
	_size?: { value: number; params?: unknown } = undefined;

	constructor(version: 'v3' | 'v4' = 'v4', itemSchema: Builder) {
		super(version, itemSchema);
		this._itemSchema = itemSchema;
	}

	/**
	 * Apply minimum size constraint.
	 */
	min(value: number, params?: unknown): this {
		this._min = { value, params };
		return this;
	}

	/**
	 * Apply maximum size constraint.
	 */
	max(value: number, params?: unknown): this {
		this._max = { value, params };
		return this;
	}

	/**
	 * Apply exact size constraint.
	 */
	size(value: number, params?: unknown): this {
		this._size = { value, params };
		return this;
	}

	protected override base(): string {
		return `z.set(${this._itemSchema.text()})`;
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._min !== undefined) {
			result = applySetMin(result, this._min.value, this._min.params);
		}
		if (this._max !== undefined) {
			result = applySetMax(result, this._max.value, this._max.params);
		}
		if (this._size !== undefined) {
			result = applySetSize(result, this._size.value, this._size.params);
		}

		return super.modify(result);
	}
}

/**
 * Apply minimum size constraint to a set schema.
 */
export function applySetMin(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.min(${value})`
		: `${zodStr}.min(${value}, ${JSON.stringify(params)})`;
}

/**
 * Apply maximum size constraint to a set schema.
 */
export function applySetMax(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.max(${value})`
		: `${zodStr}.max(${value}, ${JSON.stringify(params)})`;
}

/**
 * Apply exact size constraint to a set schema.
 */
export function applySetSize(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.size(${value})`
		: `${zodStr}.size(${value}, ${JSON.stringify(params)})`;
}
