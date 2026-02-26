import type { ZodNumber } from 'zod';
import type { BuilderFor, ParamsFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent NumberBuilder: wraps a Zod number schema string and provides chainable methods
 * that delegate to the existing apply* functions.
 *
 * INFINITY HANDLING - Version Differences:
 * - Zod v3: z.number() accepts Infinity and -Infinity by default
 * - Zod v4: z.number() REJECTS Infinity and -Infinity by default (built-in behavior)
 *   Use z.number().allowInfinity() to permit infinite values in v4
 *
 * This difference is INHERENT to Zod and not controlled by json-schema-to-zod.
 * See NUMBER-INFINITY-NOTES.md for migration guidance.
 */
export class NumberBuilder
	extends ZodBuilder<ZodNumber>
	implements BuilderFor<ZodNumber>
{
	readonly typeKind = 'number' as const;
	_int: boolean | { params?: unknown } = false;
	_multipleOf: { value: number; params?: unknown } | undefined = undefined;

	_min: { value: number; exclusive: boolean; params?: unknown } | undefined =
		undefined;

	_max: { value: number; exclusive: boolean; params?: unknown } | undefined =
		undefined;

	constructor(version: 'v3' | 'v4' = 'v4', ...params: ParamsFor<'number'>) {
		super(version, ...params);
	}

	/**
	 * Apply integer constraint.
	 */
	int(params?: unknown): this {
		if (this._int === false) {
			this._int = params !== undefined ? { params } : true;
		}
		return this;
	}

	/**
	 * Apply multipleOf constraint.
	 */
	multipleOf(value: number, params?: unknown): this {
		this._multipleOf = { value, params };
		if (this._int === false) {
			this._int = true;
		}
		return this;
	}

	/**
	 * Apply minimum constraint (gte by default).
	 */
	min(value: number, params?: unknown): this;
	min(value: number, exclusive: boolean, params?: unknown): this;
	min(
		value: number,
		exclusiveOrParams: boolean | unknown = false,
		maybeParams?: unknown,
	): this {
		const exclusive =
			typeof exclusiveOrParams === 'boolean' ? exclusiveOrParams : false;
		const params =
			typeof exclusiveOrParams === 'boolean' ? maybeParams : exclusiveOrParams;
		if (
			this._min === undefined ||
			this._min.value > value ||
			(this._min.value === value && this._min.exclusive && !exclusive)
		) {
			this._min = { value, exclusive, params };
		}
		return this;
	}

	/**
	 * Apply maximum constraint (lte by default).
	 */
	max(value: number, params?: unknown): this;
	max(value: number, exclusive: boolean, params?: unknown): this;
	max(
		value: number,
		exclusiveOrParams: boolean | unknown = false,
		maybeParams?: unknown,
	): this {
		const exclusive =
			typeof exclusiveOrParams === 'boolean' ? exclusiveOrParams : false;
		const params =
			typeof exclusiveOrParams === 'boolean' ? maybeParams : exclusiveOrParams;
		if (
			this._max === undefined ||
			this._max.value < value ||
			(this._max.value === value && this._max.exclusive && !exclusive)
		)
			this._max = { value, exclusive, params };

		return this;
	}

	/** Number check stubs — satisfies BuilderFor<ZodNumber> for methods not directly used in code generation. */
	gt(_value: number, _params?: unknown): this {
		return this;
	}
	gte(_value: number, _params?: unknown): this {
		return this;
	}
	lt(_value: number, _params?: unknown): this {
		return this;
	}
	lte(_value: number, _params?: unknown): this {
		return this;
	}
	safe(_params?: unknown): this {
		return this;
	}
	positive(_params?: unknown): this {
		return this;
	}
	negative(_params?: unknown): this {
		return this;
	}
	nonnegative(_params?: unknown): this {
		return this;
	}
	nonpositive(_params?: unknown): this {
		return this;
	}
	step(_value: number, _params?: unknown): this {
		return this;
	}
	finite(_params?: unknown): this {
		return this;
	}

	/**
	 * Compute the base number schema.
	 */
	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.number(${paramsStr})` : 'z.number()';
	}

	protected override modify(baseText: string): string {
		let result = baseText;

		if (this._int !== false) {
			result =
				typeof this._int === 'object'
					? applyInt(result, this._int.params)
					: applyInt(result);
		}

		if (this._multipleOf !== undefined) {
			result = applyMultipleOf(
				result,
				this._multipleOf.value,
				this._multipleOf.params,
			);
		}

		if (this._min !== undefined) {
			result = applyMin(
				result,
				this._min.value,
				this._min.exclusive,
				this._min.params,
			);
		}
		if (this._max !== undefined) {
			result = applyMax(
				result,
				this._max.value,
				this._max.exclusive,
				this._max.params,
			);
		}

		return super.modify(result);
	}
}

/**
 * Apply integer constraint to a number schema.
 */
export function applyInt(zodStr: string, params?: unknown): string {
	if (params !== undefined) {
		return `${zodStr}.int(${JSON.stringify(params)})`;
	}
	return `${zodStr}.int()`;
}

/**
 * Apply multipleOf constraint to a number schema.
 */
export function applyMultipleOf(
	zodStr: string,
	value: number,
	params?: unknown,
): string {
	// Special case: multipleOf 1 is equivalent to int
	if (value === 1) {
		// Avoid duplicate .int() if already present
		if (zodStr.includes('.int(')) {
			return zodStr;
		}
		return applyInt(zodStr, params);
	}

	if (params !== undefined) {
		return `${zodStr}.multipleOf(${JSON.stringify(value)}, ${JSON.stringify(params)})`;
	}
	return `${zodStr}.multipleOf(${JSON.stringify(value)})`;
}

/**
 * Apply minimum constraint to a number schema.
 */
export function applyMin(
	zodStr: string,
	value: number,
	exclusive: boolean,
	params?: unknown,
): string {
	const method = exclusive ? 'gt' : 'gte';
	if (params !== undefined) {
		return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(params)})`;
	}
	return `${zodStr}.${method}(${JSON.stringify(value)})`;
}

/**
 * Apply maximum constraint to a number schema.
 */
export function applyMax(
	zodStr: string,
	value: number,
	exclusive: boolean,
	params?: unknown,
): string {
	const method = exclusive ? 'lt' : 'lte';
	if (params !== undefined) {
		return `${zodStr}.${method}(${JSON.stringify(value)}, ${JSON.stringify(params)})`;
	}
	return `${zodStr}.${method}(${JSON.stringify(value)})`;
}
