import type { Context } from '../../context.js';
import type {
	JSONSchemaAny as JSONSchema,
	SchemaNode,
	BooleanSchema,
} from '../types/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class BooleanParser extends AbstractParser<BooleanSchema> {
	readonly typeKind = 'boolean' as const;

	constructor(schema: SchemaNode & { type?: string }, refs: Context) {
		super(schema as BooleanSchema, refs);
	}

	protected parseImpl(_schema: JSONSchema): ZodBuilder {
		return this.refs.build.boolean();
	}
}
