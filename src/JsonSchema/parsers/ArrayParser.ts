import type { Context, JsonSchema, JsonSchemaObject } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { BaseParser } from './BaseParser.js';
import { parseSchema } from './parseSchema.js';

export class ArrayParser extends BaseParser<'array'> {
	readonly typeKind = 'array' as const;

	constructor(schema: JsonSchemaObject & { type?: string }, refs: Context) {
		super(schema, refs);
	}

	protected parseImpl(schema: JsonSchema): ZodBuilder {
		const s = schema as JsonSchemaObject & { type?: string };

		// Handle tuple (array of schemas) vs array (single schema)
		if (Array.isArray(s.items)) {
			const itemSchemas = s.items.map((v, i) =>
				parseSchema(v, { ...this.refs, path: [...this.refs.path, 'items', i] }),
			);

			const builder = this.refs.build.array(itemSchemas);

			if (s.minItems !== undefined) {
				builder.min(s.minItems, s.errorMessage?.minItems);
			}
			if (s.maxItems !== undefined) {
				builder.max(s.maxItems, s.errorMessage?.maxItems);
			}

			return builder;
		}

		const itemSchema = !s.items
			? this.refs.build.any()
			: parseSchema(s.items, {
					...this.refs,
					path: [...this.refs.path, 'items'],
				});

		const builder = this.refs.build.array(itemSchema);

		if (s.minItems !== undefined) {
			builder.min(s.minItems, s.errorMessage?.minItems);
		}

		if (s.maxItems !== undefined) {
			builder.max(s.maxItems, s.errorMessage?.maxItems);
		}

		return builder;
	}

	protected canProduceType(type: string): boolean {
		return type === this.typeKind || type === 'ArrayBuilder';
	}
}
