import type { Serializable } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class ConstParser extends AbstractParser<'const'> {
	readonly typeKind = 'const' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject & { const: Serializable };
		return this.refs.build.literal(s.const);
	}
}
