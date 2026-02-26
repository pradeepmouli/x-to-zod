import type { ZodBigInt } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';
import type { ParamsFor } from '../Builder/index.js';

/**
 * BigIntBuilder: represents z.bigint() with optional constraints
 */
export class BigIntBuilder extends ZodBuilder<ZodBigInt> {
	_min?: { value: bigint; exclusive: boolean; params?: unknown } | undefined =
		undefined;

	_max?: { value: bigint; exclusive: boolean; params?: unknown } | undefined =
		undefined;

	_multipleOf?: { value: bigint; params?: unknown } | undefined = undefined;

	readonly typeKind = 'bigint' as const;
	constructor(version: 'v3' | 'v4' = 'v4', ...params: ParamsFor<'bigint'>) {
		super(version, ...params);
	}
	/**
	 * Apply minimum constraint (gte by default).
	 */
	min(
		value: bigint,
		exclusiveOrParams?: boolean | unknown,
		maybeParams?: unknown,
	): this {
		if (typeof exclusiveOrParams === 'boolean') {
			this._min = { value, exclusive: exclusiveOrParams, params: maybeParams };
			return this;
		}
		this._min = { value, exclusive: false, params: exclusiveOrParams };
		return this;
	}

	/**
	 * Apply maximum constraint (lte by default).
	 */
	max(
		value: bigint,
		exclusiveOrParams?: boolean | unknown,
		maybeParams?: unknown,
	): this {
		if (typeof exclusiveOrParams === 'boolean') {
			this._max = { value, exclusive: exclusiveOrParams, params: maybeParams };
			return this;
		}
		this._max = { value, exclusive: false, params: exclusiveOrParams };
		return this;
	}

	/**
	 * Apply multipleOf constraint.
	 */
	multipleOf(value: bigint, params?: unknown): this {
		this._multipleOf = { value, params };
		return this;
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.bigint(${paramsStr})` : 'z.bigint()';
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._min !== undefined) {
			result = applyBigIntMin(
				result,
				this._min.value,
				this._min.exclusive,
				this._min.params,
			);
		}
		if (this._max !== undefined) {
			result = applyBigIntMax(
				result,
				this._max.value,
				this._max.exclusive,
				this._max.params,
			);
		}
		if (this._multipleOf !== undefined) {
			result = applyBigIntMultipleOf(
				result,
				this._multipleOf.value,
				this._multipleOf.params,
			);
		}

		return super.modify(result);
	}
}

/**
 * Apply minimum constraint to a bigint schema.
 */
export function applyBigIntMin(
	zodStr: string,
	value: bigint,
	exclusive: boolean,
	params?: unknown,
): string {
	const method = exclusive ? 'gt' : 'gte';
	const valueStr = `${value}n`;
	return params === undefined
		? `${zodStr}.${method}(${valueStr})`
		: `${zodStr}.${method}(${valueStr}, ${JSON.stringify(params)})`;
}

/**
 * Apply maximum constraint to a bigint schema.
 */
export function applyBigIntMax(
	zodStr: string,
	value: bigint,
	exclusive: boolean,
	params?: unknown,
): string {
	const method = exclusive ? 'lt' : 'lte';
	const valueStr = `${value}n`;
	return params === undefined
		? `${zodStr}.${method}(${valueStr})`
		: `${zodStr}.${method}(${valueStr}, ${JSON.stringify(params)})`;
}

/**
 * Apply multipleOf constraint to a bigint schema.
 */
export function applyBigIntMultipleOf(
	zodStr: string,
	value: bigint,
	params?: unknown,
): string {
	const valueStr = `${value}n`;
	return params === undefined
		? `${zodStr}.multipleOf(${valueStr})`
		: `${zodStr}.multipleOf(${valueStr}, ${JSON.stringify(params)})`;
}
