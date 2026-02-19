import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { omit } from '../../utils/omit.js';

/**
 * For compatibility with OpenAPI 3.0 nullable
 */
export class NullableParser extends BaseParser<'nullable'> {
	readonly typeKind = 'nullable' as const;

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as JSONSchemaObject & { nullable: true };
		return BaseParser.parseSchema(
			omit(s as any, 'nullable'),
			this.refs,
			true,
		).nullable();
	}
}
