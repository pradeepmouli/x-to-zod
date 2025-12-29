import { Context, JsonSchemaObject } from '../../Types.js';

export const parseNull = (
	_schema: JsonSchemaObject & { type: 'null' },
	refs: Context,
) => {
	return refs.build.null();
};
