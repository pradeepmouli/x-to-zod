import { AbstractParser } from '../../Parser/AbstractParser.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
	SchemaVersion,
	TypeValue,
} from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { parseSchema } from './parseSchema.js';

type ApplicableType<TypeKind extends string> = TypeKind extends TypeValue
	? JSONSchemaObject<SchemaVersion>
	: Exclude<JSONSchemaObject<SchemaVersion>, boolean>;

/**
 * Parser for JSON Schema anyOf keyword.
 * Converts anyOf constraints to Zod union.
 */
export class AnyOfParser extends AbstractParser<'anyOf'> {
	readonly typeKind = 'anyOf' as const;

	protected parseImpl(schema: ApplicableType<'anyOf'>): Builder {
		const anyOfSchema = schema as { anyOf?: JSONSchema[] };
		const anyOf = anyOfSchema.anyOf || [];

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
