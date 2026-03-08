import type { Context } from '../../context.js';
import type { SchemaNode, StringSchema } from '../types/index.js';
import type { Builder } from '../../Builder/index.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';
import { parseSchema } from './parseSchema.js';

export class StringParser extends AbstractParser<StringSchema> {
	readonly typeKind = 'string' as const;

	constructor(schema: SchemaNode, refs: Context) {
		super(schema as StringSchema, refs);
	}

	protected parseImpl(schema: SchemaNode): Builder {
		const s = schema as SchemaNode & {
			type?: string;
			format?: string;
			pattern?: string;
			minLength?: number;
			maxLength?: number;
			contentEncoding?: string;
			contentMediaType?: string;
			contentSchema?: unknown;
			errorMessage?: Record<string, string | undefined>;
		};
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
}
