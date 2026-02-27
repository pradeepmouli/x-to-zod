import type { ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * JsonBuilder: represents z.json()
 * Validates JSON-encoded strings
 */
export class JsonBuilder
	extends ZodBuilder<ZodType>
	implements BuilderFor<ZodType>
{
	readonly typeKind = 'lazy' as const;
	private readonly _jsonParams?: unknown;

	constructor(version?: 'v3' | 'v4', params?: unknown) {
		super(version);
		this._jsonParams = params;
	}

	protected override base(): string {
		const paramsStr =
			this._jsonParams !== undefined ? JSON.stringify(this._jsonParams) : '';
		return paramsStr ? `z.json(${paramsStr})` : 'z.json()';
	}
}
