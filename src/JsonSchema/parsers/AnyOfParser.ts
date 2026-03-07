import { AbstractParser } from '../../Parser/AbstractParser.js';
import type {
	JSONSchemaAny as JSONSchema,
	AnyOfSchema,
} from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { parseSchema } from './parseSchema.js';

/**
 * Parser for JSON Schema anyOf keyword.
 * Converts anyOf constraints to Zod union.
 */
export class AnyOfParser extends AbstractParser<AnyOfSchema, 'anyOf'> {
	readonly typeKind = 'anyOf' as const;

	protected parseImpl(schema: AnyOfSchema): Builder {
		const anyOf = schema.anyOf || [];

		if (anyOf.length === 0) {
			return this.refs.build.any();
		}

		if (anyOf.length === 1 && typeof anyOf[0] !== 'boolean') {
			return this.parseChild(anyOf[0], 'anyOf', 0);
		}

		const schemas: Builder[] = anyOf.map((subSchema: JSONSchema, i: number) =>
			parseSchema(subSchema, {
				...this.refs,
				path: [...(this.refs.path || []), 'anyOf', i],
			}),
		);

		return this.refs.build.union(schemas);
	}
}
