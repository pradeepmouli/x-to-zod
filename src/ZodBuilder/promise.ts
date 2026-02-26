import type { ZodPromise } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * PromiseBuilder: represents z.promise(innerType)
 * Wraps an inner schema for async value validation
 */
export class PromiseBuilder extends ZodBuilder<
	ZodPromise,
	'promise',
	[innerSchema: Builder]
> {
	readonly typeKind = 'promise' as const;
	private readonly _innerSchema: Builder;

	constructor(version: 'v3' | 'v4' = 'v4', innerSchema: Builder) {
		super(version, innerSchema);
		this._innerSchema = innerSchema;
	}

	protected override base(): string {
		const innerStr = this._innerSchema.text();
		return `z.promise(${innerStr})`;
	}
}
