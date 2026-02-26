import type { z } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';
import type { BuilderFor, ParamsFor } from '../Builder/index.js';

/**
 * Fluent BooleanBuilder: wraps a Zod boolean schema string and provides chainable methods.
 */
export class BooleanBuilder
	extends ZodBuilder<z.ZodBoolean>
	implements BuilderFor<z.ZodBoolean>
{
	readonly typeKind = 'boolean' as const;
	constructor(version: 'v3' | 'v4' = 'v4', ...params: ParamsFor<'boolean'>) {
		super(version, ...params);
	}
}
