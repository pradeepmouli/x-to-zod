import type { JsonSchemaObject, Serializable, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class ConstParser extends BaseParser<'const'> {
	readonly typeKind = 'const' as const;

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { const: Serializable };
		return this.refs.build.literal(s.const);
	}
}
