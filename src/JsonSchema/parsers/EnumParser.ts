import type { Serializable } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class EnumParser extends AbstractParser<'enum'> {
	readonly typeKind = 'enum' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject & { enum: Serializable[] };
		return this.refs.build.enum(s.enum);
	}
}
