import { BaseParser, type ApplicableType } from './BaseParser.js';
import type { JSONSchemaAny as JSONSchema } from '../types/index.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema anyOf keyword.
 * Converts anyOf constraints to Zod union.
 */
export class AnyOfParser extends BaseParser<'anyOf'> {
	readonly typeKind = 'anyOf' as const;

	protected parseImpl(schema: ApplicableType<'anyOf'>): ZodBuilder {
		const anyOfSchema = schema as { anyOf?: JSONSchema[] };
		const anyOf = anyOfSchema.anyOf || [];

		if (anyOf.length === 0) {
			return this.refs.build.any();
		}

		if (anyOf.length === 1 && typeof anyOf[0] !== 'boolean') {
			return this.parseChild(anyOf[0], 'anyOf', 0);
		}

		const schemas = anyOf.map((subSchema: JSONSchema, i: number) =>
			parseSchema(subSchema, {
				...this.refs,
				path: [...(this.refs.path || []), 'anyOf', i],
			}),
		);

		return this.refs.build.union(schemas);
	}
}
