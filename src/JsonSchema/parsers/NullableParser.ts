import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import { omit } from '../../utils/omit.js';

/**
 * For compatibility with OpenAPI 3.0 nullable
 */
export class NullableParser extends AbstractParser<'nullable'> {
	readonly typeKind = 'nullable' as const;

	protected parseImpl(schema: JSONSchema): Builder {
		const s = schema as JSONSchemaObject & { nullable: true };
		return AbstractParser.parseSchema(
			omit(s as any, 'nullable'),
			this.refs,
			true,
		).nullable();
	}
}
