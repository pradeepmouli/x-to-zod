import type { ZodBoolean, ZodString, z } from 'zod';

import type { BuilderFor } from '../Builder/index.js';
import { CodecBuilder } from './codec.js';
import { StringBuilder } from './string.js';
import { BooleanBuilder } from './boolean.js';

export type StringBoolParams = Parameters<typeof z.stringbool>[0];

/**
 * StringBoolBuilder: represents z.stringbool() in Zod v4.
 * A codec that parses "true"/"false" strings into booleans.
 */
export class StringBoolBuilder
	extends CodecBuilder<ZodString, ZodBoolean>
	implements BuilderFor<ReturnType<(typeof z)['stringbool']>>
{
	readonly typeKind = 'pipe' as const;
	private readonly _stringBoolParams?: StringBoolParams;

	constructor(version: 'v3' | 'v4' = 'v4', _params?: StringBoolParams) {
		super(version, new StringBuilder(version), new BooleanBuilder(version));
		this._stringBoolParams = _params;
	}

	protected override base(): string {
		const paramsStr =
			this._stringBoolParams === undefined
				? ''
				: JSON.stringify(this._stringBoolParams);
		return paramsStr ? `z.stringbool(${paramsStr})` : 'z.stringbool()';
	}
}
