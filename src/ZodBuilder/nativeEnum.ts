import type { ZodEnum } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * NativeEnumBuilder: represents z.enum() in v4 or z.nativeEnum() in v3
 * Validates against TypeScript native enum values.
 *
 * In Zod v4, the enum API is unified - both native TypeScript enums and
 * string literal enums use z.enum(). In v3, native enums use z.nativeEnum().
 */
export class NativeEnumBuilder
	extends ZodBuilder<ZodEnum, 'enum', [enumReference: string]>
	implements BuilderFor<ZodEnum>
{
	readonly typeKind = 'enum' as const;

	extract(
		_values: readonly string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('Method not implemented.');
	}
	exclude(
		_values: readonly string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('Method not implemented.');
	}
	private readonly _enumReference: string;

	constructor(version: 'v3' | 'v4' = 'v4', enumReference: string) {
		super(version, enumReference);
		this._enumReference = enumReference;
	}

	protected override base(): string {
		// In v4, use unified z.enum() API
		// In v3, use z.nativeEnum() for TypeScript native enums
		if (this.isV4()) {
			return `z.enum(${this._enumReference})`;
		}
		return `z.nativeEnum(${this._enumReference})`;
	}
}
