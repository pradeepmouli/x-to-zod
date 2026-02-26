import type { ZodType } from 'zod';
import type { BuilderFor } from '../Builder/index.js';
import { ZodBuilder } from './BaseBuilder.js';

/**
 * InstanceofBuilder: represents z.instanceof(Class) in Zod v4.
 * Validates that a value is an instance of a given class.
 */
export class InstanceofBuilder
	extends ZodBuilder<ZodType>
	implements BuilderFor<ZodType>
{
	readonly typeKind = 'custom' as const;
	private readonly _className: string;

	constructor(version: 'v3' | 'v4' = 'v4', className: string) {
		super(version);
		this._className = className;
	}

	protected override base(): string {
		return `z.instanceof(${this._className})`;
	}
}
