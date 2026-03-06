import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class EnumParser extends AbstractParser<'enum'> {
	readonly typeKind = 'enum' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject;
		if (!Array.isArray(s.enum)) {
			throw new Error(
				`EnumParser: schema at path '${this.refs.path?.join('.') || '$'}' is missing a valid 'enum' array`,
			);
		}
		return this.refs.build.enum(s.enum);
	}
}
