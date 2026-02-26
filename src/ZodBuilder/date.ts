import type { z } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';
import type { ParamsFor } from '../Builder/index.js';

/**
 * DateBuilder: represents z.date() with optional constraints
 */
export class DateBuilder extends ZodBuilder<z.ZodDate> {
	readonly typeKind = 'date' as const;
	_min?: { value: Date; params?: unknown } = undefined;
	_max?: { value: Date; params?: unknown } = undefined;

	constructor(version: 'v3' | 'v4' = 'v4', ...params: ParamsFor<'date'>) {
		super(version, ...params);
	}

	/**
	 * Apply minimum date constraint.
	 */
	min(value: Date, params?: unknown): this {
		this._min = { value, params };
		return this;
	}

	/**
	 * Apply maximum date constraint.
	 */
	max(value: Date, params?: unknown): this {
		this._max = { value, params };
		return this;
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.date(${paramsStr})` : 'z.date()';
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._min !== undefined) {
			result = applyDateMin(result, this._min.value, this._min.params);
		}
		if (this._max !== undefined) {
			result = applyDateMax(result, this._max.value, this._max.params);
		}

		return super.modify(result);
	}
}

/**
 * Apply minimum date constraint to a date schema.
 */
export function applyDateMin(
	zodStr: string,
	value: Date,
	params?: unknown,
): string {
	const dateStr = `new Date(${JSON.stringify(value.toISOString())})`;
	return params === undefined
		? `${zodStr}.min(${dateStr})`
		: `${zodStr}.min(${dateStr}, ${JSON.stringify(params)})`;
}

/**
 * Apply maximum date constraint to a date schema.
 */
export function applyDateMax(
	zodStr: string,
	value: Date,
	params?: unknown,
): string {
	const dateStr = `new Date(${JSON.stringify(value.toISOString())})`;
	return params === undefined
		? `${zodStr}.max(${dateStr})`
		: `${zodStr}.max(${dateStr}, ${JSON.stringify(params)})`;
}
