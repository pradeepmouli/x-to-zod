import type { Context } from '../../Types.js';
import type { JSONSchemaObject } from '../types/index.js';

export const parseDefault = (_schema: JSONSchemaObject, refs: Context) => {
	return refs.build.any();
};
