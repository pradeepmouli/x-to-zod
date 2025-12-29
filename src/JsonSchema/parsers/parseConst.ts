import { Context, JsonSchemaObject, Serializable } from '../../Types.js';

export const parseConst = (
	schema: JsonSchemaObject & { const: Serializable },
	refs: Context,
) => {
	return refs.build.literal(schema.const);
};
