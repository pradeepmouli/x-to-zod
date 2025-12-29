import { Context, JsonSchemaObject } from '../../Types.js';

export const parseDefault = (_schema: JsonSchemaObject, refs: Context) => {
	return refs.build.any();
};
