import type { ZodXor } from 'zod';
import type { Builder, BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * XorBuilder: represents z.xor(schemas)
 * Validates exclusive OR - exactly one schema must match
 */
export class XorBuilder
	extends ZodBuilder<ZodXor, 'union', [schemas: Builder[]]>
	implements BuilderFor<ZodXor>
{
	readonly typeKind = 'union' as const;
	private readonly _schemas: Builder[];

	constructor(version: 'v3' | 'v4' = 'v4', schemas: Builder[] = []) {
		super(version, schemas);
		this._schemas = schemas;
	}

	protected override base(): string {
		const schemaStrs = this._schemas.map((schema) => schema.text());
		return `z.xor([${schemaStrs.join(',')}])`;
	}
}
