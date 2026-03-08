import type { ZodLiteral } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';
import type { Serializable } from './types.js';

/**
 * Fluent LiteralBuilder: represents z.literal() schema.
 */
export class LiteralBuilder extends ZodBuilder<
	ZodLiteral,
	'literal',
	[value: Serializable]
> {
	readonly typeKind = 'literal' as const;
	private readonly _value: Serializable;

	constructor(version: 'v3' | 'v4' = 'v4', value: Serializable = null) {
		super(version, value);
		this._value = value;
	}

	protected override base(): string {
		return `z.literal(${JSON.stringify(this._value)})`;
	}
}
