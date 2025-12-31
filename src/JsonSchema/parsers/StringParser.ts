import type { JsonSchemaObject, Context, JsonSchema } from '../../Types.js';
import { BaseParser } from './BaseParser.js';
import { parseSchema } from './parseSchema.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';

export class StringParser extends BaseParser {
	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { type?: string };
		const builder = this.refs.build.string();

		if (s.format) {
			builder.format(s.format, s.errorMessage?.format);
		}

		if (s.pattern) {
			builder.regex(s.pattern, s.errorMessage?.pattern);
		}

		if (s.minLength !== undefined) {
			builder.min(s.minLength, s.errorMessage?.minLength);
		}

		if (s.maxLength !== undefined) {
			builder.max(s.maxLength, s.errorMessage?.maxLength);
		}

		if (s.contentEncoding === 'base64') {
			const maybeBuilder = builder.base64(s.errorMessage?.contentEncoding);
			if (maybeBuilder !== builder) {
				return maybeBuilder as typeof builder;
			}
		}

		if (s.contentMediaType === 'application/json') {
			builder.json(s.errorMessage?.contentMediaType);
			if (s.contentSchema && typeof s.contentSchema === 'object') {
				const contentSchemaZod = parseSchema(s.contentSchema, this.refs);
				builder.pipe(contentSchemaZod, s.errorMessage?.contentSchema);
			}
		}

		return builder;
	}

	protected canProduceType(type: string): boolean {
		return type === 'string' || type === 'StringBuilder';
	}
}
