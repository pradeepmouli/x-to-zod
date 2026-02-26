import type { TypeKind, TypeKindOf } from './index.js';
import type { Builder, Functions, ParamsFor } from '../Builder/index.js';

import type { ZodType } from 'zod';

/**
 * Generic modifiers that can be applied to any Zod schema.
 */
function asText(input: string): string {
	return input;
}

/**
 * Apply optional modifier to a schema.
 */
export function applyOptional(zodStr: string): string {
	return `${asText(zodStr)}.optional()`;
}

/**
 * Apply nullable modifier to a schema.
 */
export function applyNullable(zodStr: string): string {
	return `${asText(zodStr)}.nullable()`;
}

/**
 * Apply default value to a schema.
 */
export function applyDefault(zodStr: string, defaultValue: unknown): string {
	return `${asText(zodStr)}.default(${JSON.stringify(defaultValue)})`;
}

/**
 * Apply describe modifier to a schema.
 */
export function applyDescribe(zodStr: string, description: string): string {
	return `${asText(zodStr)}.describe(${JSON.stringify(description)})`;
}

/**
 * Apply brand to a schema.
 */
export function applyBrand(zodStr: string, brand: string): string {
	return `${asText(zodStr)}.brand(${JSON.stringify(brand)})`;
}

/**
 * Apply readonly modifier to a schema.
 */
export function applyReadonly(zodStr: string): string {
	return `${asText(zodStr)}.readonly()`;
}

/**
 * Apply refine modifier.
 */
export function applyRefine(
	zodStr: string,
	refineFn: string,
	message?: string,
): string {
	return message
		? `${asText(zodStr)}.refine(${refineFn}, ${JSON.stringify(message)})`
		: `${asText(zodStr)}.refine(${refineFn})`;
}

/**
 * Apply superRefine modifier.
 */
export function applySuperRefine(zodStr: string, refineFn: string): string {
	return `${asText(zodStr)}.superRefine(${refineFn})`;
}

/**
 * Apply catch modifier with fallback value.
 */
export function applyCatch(zodStr: string, fallbackValue: unknown): string {
	return `${asText(zodStr)}.catch(${JSON.stringify(fallbackValue)})`;
}

/**
 * Apply meta modifier to attach metadata to a schema.
 */
export function applyMeta(
	zodStr: string,
	metadata: Record<string, unknown>,
): string {
	return `${asText(zodStr)}.meta(${JSON.stringify(metadata)})`;
}

/**
 * Apply transform modifier.
 */
export function applyTransform(zodStr: string, transformFn: string): string {
	return `${asText(zodStr)}.transform(${transformFn})`;
}

/**
 * BaseBuilder: Abstract base class for all Zod schema builders.
 * Provides shared modifier methods that apply to all schema types.
 *
 * Template Method Pattern:
 * - base(): Computes the type-specific schema string (must be overridden)
 * - modify(): Applies shared modifiers to the base schema
 * - text(): Orchestrates base() and modify() to produce final output
 *
 * @template T - The type kind (e.g., 'string', 'number', 'object')
 * @template P - The Zod params type for this builder (default: any)
 */

export abstract class ZodBuilder<
	Z extends ZodType = ZodType,
	T extends string = Z['def']['type'],
	P extends unknown[] = T extends keyof Functions ? ParamsFor<T> : unknown[],
> implements Builder<Z, T> {
	abstract readonly typeKind: T;
	protected _params?: P;
	_optional: boolean = false;
	_nullable: boolean = false;
	_readonly: boolean = false;
	_defaultValue?: unknown = undefined;

	_describeText?: string = undefined;
	_brandText?: string = undefined;
	_fallbackText?: unknown = undefined;
	_refineFn?: string = undefined;
	_refineMessage?: string = undefined;
	_superRefineFns: string[] = [];
	_metaData?: Record<string, unknown> = undefined;
	_transformFn?: string = undefined;

	protected _version?: 'v3' | 'v4';

	constructor(version: 'v3' | 'v4' = 'v4', ...params: P) {
		this._version = version;
		this._params = params.length ? params : undefined;
	}

	/**
	 * Get the target Zod version for code generation.
	 * @returns 'v3' or 'v4' (default: 'v4')
	 */
	protected get zodVersion(): import('../Types.js').ZodVersion {
		return this._version || 'v4';
	}

	/**
	 * Check if targeting Zod v4.
	 */
	protected isV4(): boolean {
		return this.zodVersion === 'v4';
	}

	/**
	 * Check if targeting Zod v3.
	 */
	protected isV3(): boolean {
		return this.zodVersion === 'v3';
	}

	/**
	 * Serialize params to a string representation for code generation.
	 * Handles objects, strings, primitives, and undefined.
	 * @returns String representation of params or empty string if no params
	 */
	protected serializeParams(): string {
		if (this._params === undefined || this._params.length === 0) return '';

		const serialized = this._params
			.map((param) => {
				if (param === undefined) return '';
				if (
					typeof param === 'object' &&
					param !== null &&
					'text' in param &&
					typeof (param as { text: () => string }).text === 'function'
				) {
					return (param as { text: () => string }).text();
				}
				return JSON.stringify(param);
			})
			.filter((param) => param !== '');

		return serialized.join(', ');
	}

	/**
	 * Apply optional constraint.
	 */
	optional(): this {
		this._optional = true;
		return this;
	}

	required(): this {
		this._optional = false;
		return this;
	}

	/**
	 * Apply nullable constraint.
	 */
	nullable(): this {
		this._nullable = true;
		return this;
	}

	/**
	 * Apply default value.
	 */
	default(value: unknown): this {
		this._defaultValue = value;
		return this;
	}

	/**
	 * Apply describe modifier.
	 */
	describe(description: string): this {
		if (description === undefined || description === null) return this;
		if (this._metaData === undefined) {
			this._metaData = {};
		}
		this._metaData.description = description;
		return this;
	}

	/**
	 * Apply brand modifier.
	 */
	brand(brand: string): this {
		this._brandText = brand;
		return this;
	}

	/**
	 * Apply readonly modifier.
	 */
	readonly(): this {
		this._readonly = true;
		return this;
	}

	/**
	 * Apply catch modifier.
	 */
	catch(fallback: unknown): this {
		this._fallbackText = fallback;
		return this;
	}

	/**
	 * Apply refine modifier.
	 *
	 * Note: function is provided as raw code string e.g. `(val) => val > 0`.
	 */
	refine(refineFn: string, message?: string): this {
		this._refineFn = refineFn;
		this._refineMessage = message;
		return this;
	}

	/**
	 * Apply superRefine modifier.
	 *
	 * Note: function is provided as raw code string e.g. `(val, ctx) => { ... }`.
	 */
	superRefine(superRefineFn: string): this {
		this._superRefineFns.push(superRefineFn);
		return this;
	}

	/**
	 * Apply meta modifier.
	 */
	meta(metadata: Record<string, unknown>): this {
		this._metaData = metadata;
		return this;
	}

	/**
	 * Apply transform modifier.
	 *
	 * Note: function is provided as raw code string e.g. `(val) => transformedVal`.
	 */
	transform(transformFn: string): this {
		this._transformFn = transformFn;
		return this;
	}

	/**
	 * Compute the type-specific base schema string.
	 *
	 * This is the core abstract method in the template method pattern.
	 * Subclasses must implement this to provide their type-specific schema string
	 * (e.g., "z.string()", "z.number()", "z.object({...})").
	 *
	 * The base schema string returned by this method will then have shared modifiers
	 * applied via the `modify()` method when `text()` is called.
	 *
	 * @returns The base Zod schema string without any modifiers applied
	 */
	protected base() {
		return `z.${this.typeKind}(${this.serializeParams()})`;
	}

	is<K extends keyof TypeKind>(type: K): this is TypeKindOf<K> {
		return String(this.typeKind) === String(type);
	}

	/**
	 * Apply all shared modifiers to the base schema string.
	 * This method is called by text() and applies modifiers in a stable order.
	 */
	protected modify(baseText: string): string {
		let result = baseText;

		// Apply modifiers in stable order to match previous string-based output
		if (
			this._metaData !== undefined &&
			Object.keys(this._metaData).length > 0
		) {
			result = applyMeta(result, this._metaData);
		}
		if (this._nullable) {
			result = applyNullable(result);
		}
		if (this._defaultValue !== undefined) {
			result = applyDefault(result, this._defaultValue);
		}
		if (this._brandText) {
			result = applyBrand(result, this._brandText);
		}
		if (this._readonly) {
			result = applyReadonly(result);
		}
		if (this._refineFn) {
			result = applyRefine(result, this._refineFn, this._refineMessage);
		}
		if (this._superRefineFns.length > 0) {
			const seen = new Set<string>();
			for (const fn of this._superRefineFns) {
				if (seen.has(fn)) continue;
				seen.add(fn);
				result = applySuperRefine(result, fn);
			}
		}
		if (this._transformFn) {
			result = applyTransform(result, this._transformFn);
		}
		if (this._optional) {
			result = applyOptional(result);
		}
		if (this._fallbackText !== undefined) {
			result = applyCatch(result, this._fallbackText);
		}

		return result;
	}

	/**
	 * Unwrap and return the final Zod code string.
	 * This orchestrates the template method pattern: text() = modify(base())
	 */
	text(): string {
		return this.modify(this.base());
	}

	toString(): string {
		return this.text();
	}
}
