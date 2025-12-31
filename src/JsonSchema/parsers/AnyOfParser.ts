import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseAnyOf } from './parseAnyOf.js';

/**
 * Parser for anyOf schemas that produces union types.
 * Delegates to the original parseAnyOf function for implementation.
 */
export class AnyOfParser extends BaseParser {
	constructor(schema: JsonSchemaObject & { anyOf?: JsonSchema[] }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { anyOf: JsonSchema[] };
		return parseAnyOf(s, this.refs);
	}

	protected canProduceType(type: string): boolean {
		return (
			type === 'union' ||
			type === 'UnionBuilder' ||
			type === 'anyOf'
		);
	}
}
