import type { ZodLazy } from 'zod';
import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * LazyBuilder: represents z.lazy(() => schema)
 * Enables recursive schema definitions
 */
export class LazyBuilder extends ZodBuilder<ZodLazy, 'lazy', [input: Builder]> {
	readonly typeKind = 'lazy' as const;
	private readonly _input: Builder;

	constructor(version: 'v3' | 'v4' = 'v4', input: Builder) {
		super(version, input);
		this._input = input;
	}

	protected override base(): string {
		return `z.lazy(() => ${this._input.text()})`;
	}
}
