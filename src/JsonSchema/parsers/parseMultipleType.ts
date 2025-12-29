import { JsonSchemaObject, Context } from '../../Types.js';
import { parseSchema } from './parseSchema.js';

export const parseMultipleType = (
	schema: JsonSchemaObject & { type: string[] },
	refs: Context,
) => {
	return refs.build.union(
		schema.type.map((type: string) =>
			parseSchema({ ...schema, type } as any, {
				...refs,
				withoutDefaults: true,
			}),
		),
	);
};
