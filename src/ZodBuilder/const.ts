import type { ZodTemplateLiteral } from 'zod';
import { Serializable } from './types.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent ConstBuilder: wraps a Zod literal schema string and provides chainable methods.
 */
export class ConstBuilder extends ZodBuilder<
	ZodTemplateLiteral,
	'template_literal',
	[value: Serializable]
> {
	readonly typeKind = 'template_literal' as const;
	private readonly _value: Serializable;

	constructor(version: 'v3' | 'v4' = 'v4', value: Serializable = null) {
		super(version, value);
		this._value = value;
	}

	protected override base(): string {
		return `z.literal(${JSON.stringify(this._value)})`;
	}
}
