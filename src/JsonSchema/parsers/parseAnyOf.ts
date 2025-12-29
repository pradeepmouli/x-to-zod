import { JsonSchemaObject, JsonSchema, Context } from '../../Types.js';
import type { ZodBuilder } from '../../ZodBuilder/BaseBuilder.js';
import { type UnionBuilder } from '../../ZodBuilder/index.js';
import { parseSchema } from './parseSchema.js';

export const parseAnyOf = (
	schema: JsonSchemaObject & { anyOf: JsonSchema[] },
	refs: Context,
): UnionBuilder | ZodBuilder => {
	return schema.anyOf.length
		? schema.anyOf.length === 1
			? parseSchema(schema.anyOf[0], {
					...refs,
					path: [...refs.path, 'anyOf', 0],
				})
			: refs.build.union(
					schema.anyOf.map((schema: JsonSchema, i: number) =>
						parseSchema(schema, { ...refs, path: [...refs.path, 'anyOf', i] }),
					),
				)
		: refs.build.any();
};
