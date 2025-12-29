import type { z } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * Fluent BooleanBuilder: wraps a Zod boolean schema string and provides chainable methods.
 */
export class BooleanBuilder extends ZodBuilder<
	'boolean',
	Parameters<typeof z.boolean>[0]
> {
	readonly typeKind = 'boolean' as const;
	constructor(params?: Parameters<typeof z.boolean>[0], version?: 'v3' | 'v4') {
		super(version);
		this._params = params;
	}

	protected override base(): string {
		const paramsStr = this.serializeParams();
		return paramsStr ? `z.boolean(${paramsStr})` : 'z.boolean()';
	}
}
