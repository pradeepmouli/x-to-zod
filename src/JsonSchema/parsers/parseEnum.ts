import type { Serializable } from '../../Types.js';
import type { JSONSchema } from 'json-schema-typed/draft-2020-12';
import { build } from '../../ZodBuilder/index.js';

export const parseEnum = (
	schema: JSONSchema.Interface & { enum: Serializable[] },
) => {
	return build.enum(schema.enum);
};
