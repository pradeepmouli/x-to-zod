import type { Options } from './Types.js';
import type { JSONSchemaAny as JSONSchema } from './JsonSchema/types/index.js';
import { toZod } from './JsonSchema/index.js';

export const jsonSchemaToZod = (
	schema: JSONSchema,
	options?: Options,
): string => {
	return toZod(schema, options);
};
