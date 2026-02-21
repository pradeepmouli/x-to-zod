import { BaseParser } from './BaseParser.js';
import type { JSONSchemaAny as JSONSchema } from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import type { buildV4 } from '../../ZodBuilder/v4.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema oneOf keyword.
 * Converts oneOf constraints to Zod xor (v4) or union (v3).
 */
export class OneOfParser extends BaseParser<'oneOf'> {
	readonly typeKind = 'oneOf' as const;

	protected parseImpl(schema: JSONSchema): Builder {
		const oneOfSchema = schema as { oneOf?: JSONSchema[] };
		const oneOf = oneOfSchema.oneOf || [];

		if (oneOf.length === 0) {
			return this.refs.build.any();
		}

		if (oneOf.length === 1) {
			return this.parseChild(oneOf[0], 'oneOf', 0);
		}

		const schemaBuilders: Builder[] = oneOf.map(
			(subSchema: JSONSchema, i: number) =>
				parseSchema(subSchema, {
					...this.refs,
					path: [...(this.refs.path || []), 'oneOf', i],
				}),
		);

		// Use xor for v4, union for v3
		if (this.refs.zodVersion === 'v4' && 'xor' in this.refs.build) {
			return (this.refs.build as typeof buildV4).xor(schemaBuilders);
		}

		return this.refs.build.union(schemaBuilders);
	}
}
