import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseAllOf } from './parseAllOf.js';

/**
 * Parser for allOf schemas that produces intersection types.
 * Delegates to the original parseAllOf function for implementation.
 */
export class AllOfParser extends BaseParser {
	constructor(schema: JsonSchemaObject & { allOf?: JsonSchema[] }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { allOf: JsonSchema[] };
		return parseAllOf(s, this.refs);
	}

	protected canProduceType(type: string): boolean {
		return (
			type === 'intersection' ||
			type === 'IntersectionBuilder' ||
			type === 'allOf'
		);
	}
}
