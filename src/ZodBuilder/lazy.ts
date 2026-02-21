import type { Builder } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * LazyBuilder: represents z.lazy(() => schema)
 * Enables recursive schema definitions
 */
export class LazyBuilder extends ZodBuilder<'lazy'> {
	readonly typeKind = 'lazy' as const;
	private readonly _input: Builder;

	constructor(input: Builder, version?: 'v3' | 'v4') {
		super(version);
		this._input = input;
	}

	protected override base(): string {
		return `z.lazy(() => ${this._input.text()})`;
	}
}
