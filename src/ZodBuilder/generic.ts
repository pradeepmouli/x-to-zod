import type { ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * GenericBuilder: A concrete builder for arbitrary Zod schema strings.
 * Used when we need to wrap a pre-computed schema string (e.g., complex templates).
 */
export class GenericBuilder
	extends ZodBuilder<ZodType>
	implements BuilderFor<ZodType>
{
	readonly typeKind: ZodType['type'];
	private readonly _code: string;

	constructor(version: 'v3' | 'v4' = 'v4', code: string) {
		super(version);
		this._code = code;
		this.typeKind = 'unknown';
	}

	protected override base(): string {
		return this._code;
	}
}
