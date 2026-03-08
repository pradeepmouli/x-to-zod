import type { Context } from '../../context.js';
import type { SchemaNode } from '../types/index.js';

export const parseDefault = (_schema: SchemaNode, refs: Context) => {
	return refs.build.any();
};
