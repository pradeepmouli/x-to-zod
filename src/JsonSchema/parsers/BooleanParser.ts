import type { JsonSchemaObject, Context, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class BooleanParser extends BaseParser<'boolean'> {
	readonly typeKind = 'boolean' as const;

	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(_schema: JsonSchema): ZodBuilder {
		return this.refs.build.boolean();
	}

	protected canProduceType(type: string): boolean {
		return type === this.typeKind || type === 'BooleanBuilder';
	}
}
