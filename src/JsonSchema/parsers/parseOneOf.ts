import { JsonSchemaObject, JsonSchema, Context } from '../../Types.js';
import { BaseBuilder } from '../../ZodBuilder/index.js';
import type { buildV4 } from '../../ZodBuilder/v4.js';
import { parseSchema } from './parseSchema.js';

export const parseOneOf = (
	schema: JsonSchemaObject & { oneOf: JsonSchema[] },
	refs: Context,
): BaseBuilder => {
	const schemaBuilders = schema.oneOf.map((schema: JsonSchema, i: number) =>
		parseSchema(schema, {
			...refs,
			path: [...refs.path, 'oneOf', i],
		}),
	);

	if (!schema.oneOf.length) {
		return refs.build.any();
	}

	if (schema.oneOf.length === 1) {
		return schemaBuilders[0];
	}

	if (refs.zodVersion !== 'v3' && 'xor' in refs.build) {
		return (refs.build as typeof buildV4).xor(schemaBuilders);
	}

	return refs.build.union(schemaBuilders);
};
