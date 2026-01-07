import { BaseParser } from './BaseParser.js';
import type { JsonSchema } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema anyOf keyword.
 * Converts anyOf constraints to Zod union.
 */
export class AnyOfParser extends BaseParser<'anyOf'> {
	readonly typeKind = 'anyOf' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const anyOfSchema = schema as { anyOf?: JsonSchema[] };
		const anyOf = anyOfSchema.anyOf || [];

		if (anyOf.length === 0) {
			return this.refs.build.any();
		}

		if (anyOf.length === 1) {
			return this.parseChild(anyOf[0], 'anyOf', 0);
		}

		const schemas = anyOf.map((subSchema: JsonSchema, i: number) =>
			parseSchema(subSchema, {
				...this.refs,
				path: [...(this.refs.path || []), 'anyOf', i],
			}),
		);

		return this.refs.build.union(schemas);
	}

	protected canProduceType(type: string): boolean {
		return type === this.typeKind || type === 'UnionBuilder';
	}
}
