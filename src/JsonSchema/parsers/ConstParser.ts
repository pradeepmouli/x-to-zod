import type { Serializable, JsonSchemaObject } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class ConstParser extends BaseParser<
	JsonSchemaObject & { const: Serializable }
> {
	parse(): ZodBuilder {
		return this.refs.build.literal(this.schema.const);
	}
}
