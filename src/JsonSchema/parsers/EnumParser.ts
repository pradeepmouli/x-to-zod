import type {
	Serializable,
	JsonSchema,
	JsonSchemaObject,
} from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class EnumParser extends BaseParser<'enum'> {
	readonly typeKind = 'enum' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { enum: Serializable[] };
		return this.refs.build.enum(s.enum);
	}
}
