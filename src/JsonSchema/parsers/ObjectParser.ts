import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseObject } from './parseObject.js';

export class ObjectParser extends BaseParser<'object'> {
	readonly typeKind = 'object' as const;

	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		return parseObject(
			schema as JsonSchemaObject & { type: 'object' },
			this.refs,
		);
	}

	protected canProduceType(type: string): boolean {
		return type === this.typeKind || type === 'ObjectBuilder';
	}
}
