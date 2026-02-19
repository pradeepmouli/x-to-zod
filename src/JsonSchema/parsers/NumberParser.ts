import type { Context } from '../../Types.js';
import { type JSONSchemaObject } from '../types/index.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NumberParser extends BaseParser<'number' | 'integer'> {
	readonly typeKind = 'number' as const;

	constructor(schema: JSONSchemaObject, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JSONSchemaObject): ZodBuilder {
		const s = schema as JSONSchemaObject & {
			type?: string;
			format?: string;
			multipleOf?: number;
			minimum?: number;
			exclusiveMinimum?: number;
			maximum?: number;
			exclusiveMaximum?: number;
			errorMessage?: Record<string, string | undefined>;
		};
		const builder = this.refs.build.number();

		if (s.type === 'integer') {
			builder.int(s.errorMessage?.type);
		} else if (s.format === 'int64') {
			builder.int(s.errorMessage?.format);
		}

		if (s.multipleOf !== undefined) {
			builder.multipleOf(s.multipleOf, s.errorMessage?.multipleOf);
		}

		if (typeof s.minimum === 'number') {
			builder.min(s.minimum, false, s.errorMessage?.minimum);
		} else if (typeof s.exclusiveMinimum === 'number') {
			builder.min(s.exclusiveMinimum, true, s.errorMessage?.exclusiveMinimum);
		}

		if (typeof s.maximum === 'number') {
			builder.max(s.maximum, false, s.errorMessage?.maximum);
		} else if (typeof s.exclusiveMaximum === 'number') {
			builder.max(s.exclusiveMaximum, true, s.errorMessage?.exclusiveMaximum);
		}

		return builder;
	}

}
