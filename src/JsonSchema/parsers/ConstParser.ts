import type { JSONSchemaObject } from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class ConstParser extends AbstractParser<'const'> {
	readonly typeKind = 'const' as const;

	protected parseImpl(schema: JSONSchemaObject): ZodBuilder {
		if (!('const' in schema)) {
			throw new Error(
				`ConstParser: schema at path '${this.refs.path?.join('.') || '$'}' is missing a 'const' property`,
			);
		}
		return this.refs.build.literal(schema.const);
	}
}
