import type { Context } from '../../context.js';
import type { SchemaNode, ArraySchema } from '../types/index.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';

export class ArrayParser extends AbstractParser<ArraySchema> {
	readonly typeKind = 'array' as const;

	constructor(schema: SchemaNode & { type?: string }, refs: Context) {
		super(schema as ArraySchema, refs);
	}

	protected parseImpl(schema: SchemaNode): ZodBuilder {
		const s = schema as SchemaNode & {
			errorMessage?: Record<string, string | undefined>;
		};

		// Handle tuple (array of schemas) vs array (single schema)
		if (Array.isArray(s.items)) {
			const itemSchemas = s.items.map((v: unknown, i: number) =>
				this.parseChild(v as any, 'items', i),
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
			: this.parseChild(s.items as any, 'items');

		const builder = this.refs.build.array(itemSchema);

		if (s.minItems !== undefined) {
			builder.min(s.minItems, s.errorMessage?.minItems);
		}

		if (s.maxItems !== undefined) {
			builder.max(s.maxItems, s.errorMessage?.maxItems);
		}

		return builder;
	}
}
