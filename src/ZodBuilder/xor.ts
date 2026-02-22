import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * XorBuilder: represents z.xor(schemas)
 * Validates exclusive OR - exactly one schema must match
 */
export class XorBuilder extends ZodBuilder<'xor'> {
	readonly typeKind = 'xor' as const;
	private readonly _schemas: Builder[];

	constructor(schemas: Builder[], version?: 'v3' | 'v4') {
		super(version);
		this._schemas = schemas;
	}

	protected override base(): string {
		const schemaStrs = this._schemas.map((schema) => schema.text());
		return `z.xor([${schemaStrs.join(',')}])`;
	}
}
