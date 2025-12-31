import type { JsonSchemaObject, Context, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class NullParser extends BaseParser {
	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(_schema: JsonSchema): ZodBuilder {
		return this.refs.build.null();
	}

	protected canProduceType(type: string): boolean {
		return type === 'null' || type === 'NullBuilder';
	}
}
