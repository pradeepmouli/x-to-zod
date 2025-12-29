import { Context, JsonSchemaObject } from '../../Types.js';

export const parseBoolean = (
	schema: JsonSchemaObject & { type: 'boolean' },
	refs: Context,
) => {
	return refs.build.boolean();
};
