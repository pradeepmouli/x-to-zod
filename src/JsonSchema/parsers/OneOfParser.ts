import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseOneOf } from './parseOneOf.js';

/**
 * Parser for oneOf schemas that produces union or xor types.
 * Delegates to the original parseOneOf function for implementation.
 * In v4, uses xor for exclusive-or semantics; in v3, falls back to union.
 */
export class OneOfParser extends BaseParser {
	constructor(
		schema: JsonSchemaObject & { oneOf?: JsonSchema[] },
		refs: Context,
	) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { oneOf: JsonSchema[] };
		return parseOneOf(s, this.refs);
	}

	protected canProduceType(type: string): boolean {
		return (
			type === 'union' ||
			type === 'UnionBuilder' ||
			type === 'oneOf' ||
			type === 'xor' ||
			type === 'XorBuilder'
		);
	}
}
