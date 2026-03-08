import type { Context } from '../../context.js';
import type {
	JSONSchemaAny as JSONSchema,
	SchemaNode,
	TupleSchema,
} from '../types/index.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { AbstractParser } from '../../Parser/AbstractParser.js';

/**
 * Parser for JSON Schema tuple types.
 *
 * Handles both:
 * - `prefixItems` (draft 2020-12): The standard tuple keyword
 * - `items` as array (draft-07): Legacy tuple syntax
 *
 * Produces `z.tuple([...])` via the TupleBuilder.
 */
export class TupleParser extends AbstractParser<TupleSchema, 'tuple'> {
	readonly typeKind = 'tuple' as const;

	constructor(schema: SchemaNode, refs: Context) {
		super(schema as TupleSchema, refs);
	}

	protected parseImpl(schema: JSONSchema): ZodBuilder {
		const s = schema as SchemaNode;
		const tupleSchema = s as any;

		// Draft 2020-12: prefixItems is the standard tuple keyword
		const tupleItems: JSONSchema[] =
			tupleSchema.prefixItems ??
			(Array.isArray(tupleSchema.items) ? tupleSchema.items : []);

		const itemSchemas = tupleItems.map((item, i) =>
			this.parseChild(
				item,
				tupleSchema.prefixItems ? 'prefixItems' : 'items',
				i,
			),
		);

		return this.refs.build.tuple(itemSchemas);
	}
}
