import type { Context, Serializable } from '../../Types.js';
import type { JSONSchema } from 'json-schema-typed/draft-2020-12';

export const parseEnum = (
	schema: JSONSchema.Interface & { enum: Serializable[] },
	refs: Context,
) => {
	return refs.build.enum(schema.enum);
};
