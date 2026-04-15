import type { ZodEnum } from 'zod';
import type { Builder, BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * KeyofBuilder: represents z.keyof(objectSchema)
 * Extracts keys from an object schema as an enum
 */
export class KeyofBuilder
	extends ZodBuilder<ZodEnum, 'enum', [objectSchema: Builder]>
	implements BuilderFor<ZodEnum>
{
	readonly typeKind = 'enum' as const;

	extract(
		_values: readonly string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('KeyofBuilder.extract() is not implemented yet.');
	}
	exclude(
		_values: readonly string[],
		_params?: string | Record<string, unknown>,
	): this {
		throw new Error('KeyofBuilder.exclude() is not implemented yet.');
	}
	private readonly _objectSchema: Builder;

	constructor(version: 'v3' | 'v4' = 'v4', objectSchema: Builder) {
		super(version, objectSchema);
		this._objectSchema = objectSchema;
	}

	protected override base(): string {
		const objectStr = this._objectSchema.text();
		return `z.keyof(${objectStr})`;
	}
}
