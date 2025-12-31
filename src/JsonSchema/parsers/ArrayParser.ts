import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseArray } from './parseArray.js';

export class ArrayParser extends BaseParser<'array'> {
	readonly typeKind = 'array' as const;

	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		return parseArray(
			schema as JsonSchemaObject & { type: 'array' },
			this.refs,
		);
	}

	protected canProduceType(type: string): boolean {
		return type === this.typeKind || type === 'ArrayBuilder';
	}
}
