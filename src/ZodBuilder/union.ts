import type { ZodUnion } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent UnionBuilder: represents z.union() schema.
 * Accepts multiple schemas and creates a union type.
 */
export class UnionBuilder extends ZodBuilder<
	ZodUnion,
	'union',
	[schemas: Builder[]]
> {
	readonly typeKind = 'union' as const;
	private readonly _schemas: Builder[];

	constructor(version: 'v3' | 'v4' = 'v4', schemas: Builder[] = []) {
		super(version, schemas);
		this._schemas = schemas;
	}

	protected override base(): string {
		const schemaStrings = this._schemas.map((s) => s.text());
		return `z.union([${schemaStrings.join(', ')}])`;
	}
}
