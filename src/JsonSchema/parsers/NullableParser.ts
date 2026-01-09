import type { JsonSchemaObject } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { omit } from '../../utils/omit.js';

/**
 * For compatibility with OpenAPI 3.0 nullable
 */
export class NullableParser extends BaseParser<
	JsonSchemaObject & { nullable: true }
> {
	parse(): ZodBuilder {
		return BaseParser.parseSchema(
			omit(this.schema, 'nullable'),
			this.refs,
			true,
		).nullable();
	}
}
