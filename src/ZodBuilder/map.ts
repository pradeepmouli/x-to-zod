import type { ZodMap } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * MapBuilder: represents z.map() with optional constraints
 */
export class MapBuilder extends ZodBuilder<
	ZodMap,
	'map',
	[keySchema: Builder, valueSchema: Builder]
> {
	readonly typeKind = 'map' as const;
	_keySchema: Builder;
	_valueSchema: Builder;
	_min?: { value: number; params?: unknown } = undefined;
	_max?: { value: number; params?: unknown } = undefined;
	_size?: { value: number; params?: unknown } = undefined;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		keySchema: Builder,
		valueSchema: Builder,
	) {
		super(version, keySchema, valueSchema);
		this._keySchema = keySchema;
		this._valueSchema = valueSchema;
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
		return `z.map(${this._keySchema.text()}, ${this._valueSchema.text()})`;
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._min !== undefined) {
			result = applyMapMin(result, this._min.value, this._min.params);
		}
		if (this._max !== undefined) {
			result = applyMapMax(result, this._max.value, this._max.params);
		}
		if (this._size !== undefined) {
			result = applyMapSize(result, this._size.value, this._size.params);
		}

		return super.modify(result);
	}
}

/**
 * Apply minimum size constraint to a map schema.
 */
export function applyMapMin(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.min(${value})`
		: `${zodStr}.min(${value}, ${JSON.stringify(params)})`;
}

/**
 * Apply maximum size constraint to a map schema.
 */
export function applyMapMax(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.max(${value})`
		: `${zodStr}.max(${value}, ${JSON.stringify(params)})`;
}

/**
 * Apply exact size constraint to a map schema.
 */
export function applyMapSize(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	return params === undefined
		? `${zodStr}.size(${value})`
		: `${zodStr}.size(${value}, ${JSON.stringify(params)})`;
}
