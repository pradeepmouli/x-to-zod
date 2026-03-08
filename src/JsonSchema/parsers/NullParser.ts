import type { Context } from '../../context.js';
import type {
	JSONSchemaAny as JSONSchema,
	SchemaNode,
	NullSchema,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NullParser extends AbstractParser<NullSchema> {
	readonly typeKind = 'null' as const;

	constructor(schema: SchemaNode & { type?: string }, refs: Context) {
		super(schema as NullSchema, refs);
	}

	protected parseImpl(_schema: JSONSchema): ZodBuilder {
		return this.refs.build.null();
	}
}
