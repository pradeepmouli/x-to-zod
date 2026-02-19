import type { Context } from '../../Types.js';
import type {
	JSONSchemaAny as JSONSchema,
	JSONSchemaObject,
} from '../types/index.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NullParser extends BaseParser<'null'> {
	readonly typeKind = 'null' as const;

	constructor(schema: JSONSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(_schema: JSONSchema): ZodBuilder {
		return this.refs.build.null();
	}
}
