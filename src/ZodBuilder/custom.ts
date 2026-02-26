import type { ZodCustom } from 'zod';
import { ZodBuilder } from './BaseBuilder.js';
import type { BuilderFor } from '../Builder/index.js';

/**
 * CustomBuilder: represents z.custom() for custom validation
 */
export class CustomBuilder
	extends ZodBuilder<ZodCustom, 'custom', [params?: unknown]>
	implements BuilderFor<ZodCustom>
{
	readonly typeKind = 'custom' as const;
	_validateFn?: string;

	constructor(
		version: 'v3' | 'v4' = 'v4',
		validateFn?: string,
		params?: unknown,
	) {
		super(version, params);
		this._validateFn = validateFn;
	}

	protected override base(): string {
		if (this._validateFn) {
			const params = this._params?.[0];
			if (params !== undefined) {
				return `z.custom(${this._validateFn}, ${JSON.stringify(params)})`;
			}
			return `z.custom(${this._validateFn})`;
		}
		return 'z.custom()';
	}
}
